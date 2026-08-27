# backend/recommandations/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Recommandation, RegleAgronomique
from .serializers import (
    RecommandationSerializer,
    RegleAgronomiqueSerializer,
    HistoriqueRecommandationSerializer
)
from .services import RecommendationGenerator, RecommendationRepository
from parcelles.models import Parcelle

class RecommandationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour consulter les recommandations
    """
    serializer_class = RecommandationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recommandation.objects.filter(
            parcelle__agriculteur=self.request.user
        )

    @action(detail=False, methods=['post'])
    def generer(self, request):
        """
        Générer des recommandations pour une parcelle
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

        recommandations = RecommendationGenerator.sauvegarder(parcelle)
        serializer = RecommandationSerializer(recommandations, many=True)

        return Response({
            'message': f'{len(recommandations)} recommandations générées',
            'data': serializer.data
        })

    @action(detail=False, methods=['get'])
    def pour_parcelle(self, request):
        """
        Récupérer les recommandations actives pour une parcelle
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

        recommandations = RecommendationRepository.obtenir_actives(parcelle)
        serializer = RecommandationSerializer(recommandations, many=True)

        return Response(serializer.data)

    # ✅ NOUVEAU: Endpoint pour les recommandations priorisées
    @action(detail=False, methods=['get'])
    def priorisees(self, request):
        """
        Récupérer les recommandations triées par priorité
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

        recommandations = RecommendationRepository.obtenir_priorisees(parcelle)
        serializer = RecommandationSerializer(recommandations, many=True)

        return Response(serializer.data)

    # ✅ NOUVEAU: Statistiques des recommandations
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Obtenir les statistiques des recommandations
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

        stats = RecommendationRepository.obtenir_statistiques(parcelle)
        return Response(stats)

    @action(detail=False, methods=['get'])
    def historique(self, request):
        """
        Récupérer l'historique des recommandations pour une parcelle
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

        historique = RecommendationRepository.obtenir_historique(parcelle)
        serializer = RecommandationSerializer(historique, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def marquer_lue(self, request):
        """
        Marquer une recommandation comme lue
        """
        recommandation_id = request.data.get('recommandation_id')

        if not recommandation_id:
            return Response(
                {'error': 'recommandation_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rec = RecommendationRepository.marquer_lue(
            recommandation_id,
            utilisateur=request.user
        )

        if not rec:
            return Response(
                {'error': 'Recommandation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(RecommandationSerializer(rec).data)

    @action(detail=False, methods=['post'])
    def marquer_appliquee(self, request):
        """
        Marquer une recommandation comme appliquée
        """
        recommandation_id = request.data.get('recommandation_id')

        if not recommandation_id:
            return Response(
                {'error': 'recommandation_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rec = RecommendationRepository.marquer_appliquee(
            recommandation_id,
            utilisateur=request.user
        )

        if not rec:
            return Response(
                {'error': 'Recommandation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(RecommandationSerializer(rec).data)

class RegleAgronomiqueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour consulter les règles agronomiques
    """
    queryset = RegleAgronomique.objects.filter(active=True)
    serializer_class = RegleAgronomiqueSerializer
    permission_classes = [permissions.IsAuthenticated]