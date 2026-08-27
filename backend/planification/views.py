# backend/planification/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Calendrier
from .serializers import CalendrierSerializer
from .services import CalendrierService
from parcelles.models import Parcelle
from datetime import date

class CalendrierViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour consulter les calendriers
    """
    serializer_class = CalendrierSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Calendrier.objects.filter(
            parcelle__agriculteur=self.request.user
        )

    def list(self, request, *args, **kwargs):
        """
        Liste les calendriers avec ajustement automatique des statuts
        """
        parcelle_id = request.query_params.get('parcelle_id')
        
        if parcelle_id:
            try:
                parcelle = Parcelle.objects.get(
                    id=parcelle_id,
                    agriculteur=request.user
                )
                etapes = Calendrier.objects.filter(parcelle=parcelle)
                for e in etapes:
                    if e.date_prevue < date.today() and e.statut not in ['realise', 'annule']:
                        e.statut = 'en_retard'
                        e.save()
            except Parcelle.DoesNotExist:
                pass
        
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def prochaine(self, request):
        """
        Obtenir la prochaine étape pour une parcelle
        """
        parcelle_id = request.query_params.get('parcelle_id')

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        prochaine = CalendrierService.obtenir_prochaine_etape(parcelle)

        if prochaine:
            return Response(CalendrierSerializer(prochaine).data)
        return Response(
            {'message': 'Aucune étape à venir'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Obtenir les statistiques pour une parcelle
        """
        parcelle_id = request.query_params.get('parcelle_id')

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        stats = CalendrierService.obtenir_statistiques(parcelle)
        return Response(stats)

    @action(detail=False, methods=['post'], url_path='marquer_realisee')
    def marquer_realisee(self, request):
        """
        Marquer une étape comme réalisée
        """
        parcelle_id = request.data.get('parcelle_id')
        etape_id = request.data.get('etape_id')

        if not parcelle_id or not etape_id:
            return Response(
                {'error': 'parcelle_id et etape_id sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            calendrier = Calendrier.objects.get(
                parcelle=parcelle,
                etape_id=etape_id
            )
        except Calendrier.DoesNotExist:
            return Response(
                {'error': 'Étape non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        if calendrier.statut == 'realise':
            return Response(
                {'error': 'Cette étape est déjà réalisée'},
                status=status.HTTP_400_BAD_REQUEST
            )

        calendrier.statut = 'realise'
        calendrier.date_realisation = date.today()
        calendrier.save()

        # Créer une action dans l'historique
        try:
            from suivi.models import ActionRealisee
            ActionRealisee.objects.create(
                parcelle=parcelle,
                etape=calendrier.etape,
                commentaire="Étape marquée comme réalisée",
                realise_par=request.user
            )
        except Exception as e:
            print(f"⚠️ Erreur création historique: {e}")

        return Response({
            'message': 'Étape marquée comme réalisée',
            'data': CalendrierSerializer(calendrier).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='ajuster')
    def ajuster(self, request):
        """
        Ajuste automatiquement le calendrier
        """
        parcelle_id = request.data.get('parcelle_id')

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        etapes = Calendrier.objects.filter(parcelle=parcelle)
        ajustements = []
        
        for e in etapes:
            if e.date_prevue < date.today() and e.statut not in ['realise', 'annule']:
                old_statut = e.statut
                e.statut = 'en_retard'
                e.save()
                ajustements.append({
                    'etape': e.etape.nom,
                    'ancien_statut': old_statut,
                    'nouveau_statut': e.statut,
                    'date_prevue': e.date_prevue
                })

        return Response({
            'message': f"{len(ajustements)} étape(s) marquée(s) comme en retard",
            'ajustements': ajustements
        })

    @action(detail=False, methods=['get'], url_path='historique_ajustements')
    def historique_ajustements(self, request):
        """
        Récupère l'historique des ajustements
        """
        parcelle_id = request.query_params.get('parcelle_id')

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        etapes = Calendrier.objects.filter(
            parcelle=parcelle
        ).order_by('-date_prevue')

        return Response([
            {
                'id': e.id,
                'etape': e.etape.nom,
                'statut': e.statut,
                'date_prevue': e.date_prevue,
                'date_realisation': e.date_realisation,
            }
            for e in etapes
        ])