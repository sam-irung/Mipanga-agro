from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ActionRealisee, NoteParcelle
from .serializers import ActionRealiseeSerializer, NoteParcelleSerializer
from .services import SuiviService
from parcelles.models import Parcelle

class ActionRealiseeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour consulter les actions réalisées
    """
    serializer_class = ActionRealiseeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActionRealisee.objects.filter(
            parcelle__agriculteur=self.request.user
        )

    @action(detail=False, methods=['post'])
    def marquer(self, request):
        """
        Marquer une étape comme réalisée
        """
        parcelle_id = request.data.get('parcelle_id')
        etape_id = request.data.get('etape_id')
        commentaire = request.data.get('commentaire', '')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

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

        resultat = SuiviService.marquer_etape_realisee(
            parcelle=parcelle,
            etape_id=etape_id,
            utilisateur=request.user,
            commentaire=commentaire,
            latitude=latitude,
            longitude=longitude
        )

        if isinstance(resultat, dict) and 'error' in resultat:
            return Response(resultat, status=status.HTTP_400_BAD_REQUEST)

        if not resultat:
            return Response(
                {'error': 'Étape non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ActionRealiseeSerializer(resultat)
        return Response({
            'message': 'Étape marquée comme réalisée',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def historique(self, request):
        """
        Récupérer l'historique des actions pour une parcelle
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

        historique = SuiviService.obtenir_historique(parcelle)
        serializer = ActionRealiseeSerializer(historique, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Obtenir les statistiques de suivi pour une parcelle
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

        stats = SuiviService.obtenir_statistiques_suivi(parcelle)

        serializer = ActionRealiseeSerializer(stats['dernieres_actions'], many=True)
        stats['dernieres_actions'] = serializer.data

        return Response(stats)


class NoteParcelleViewSet(viewsets.ModelViewSet):
    """
    API pour gérer les notes sur les parcelles
    """
    serializer_class = NoteParcelleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NoteParcelle.objects.filter(
            parcelle__agriculteur=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)

    @action(detail=False, methods=['get'])
    def pour_parcelle(self, request):
        """
        Récupérer les notes pour une parcelle
        """
        parcelle_id = request.query_params.get('parcelle_id')
        type_note = request.query_params.get('type')

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

        notes = SuiviService.obtenir_notes(parcelle, type_note)
        serializer = NoteParcelleSerializer(notes, many=True)

        return Response(serializer.data)