# backend/saisons/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services.season_service import SeasonService
from .serializers import (
    ProfilSaisonSerializer,
    ScoreCultureSaisonSerializer,
    RecommandationSaisonSerializer
)
from cultures.models import ZoneAgricole

class SaisonActuelleView(APIView):
    """
    Récupère la saison actuelle
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        zone_id = request.query_params.get('zone_id')

        if not zone_id:
            return Response(
                {'error': 'zone_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            zone = ZoneAgricole.objects.get(id=zone_id)
        except ZoneAgricole.DoesNotExist:
            return Response(
                {'error': 'Zone non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        saison = SeasonService.get_saison_actuelle(zone_id)
        serializer = ProfilSaisonSerializer(saison)

        return Response(serializer.data)


class CulturesRecommandeesView(APIView):
    """
    Récupère les cultures recommandées
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        zone_id = request.query_params.get('zone_id')

        if not zone_id:
            return Response(
                {'error': 'zone_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            zone = ZoneAgricole.objects.get(id=zone_id)
        except ZoneAgricole.DoesNotExist:
            return Response(
                {'error': 'Zone non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        resultat = SeasonService.get_cultures_recommandees(zone_id)

        return Response({
            'saison': ProfilSaisonSerializer(resultat['saison']).data,
            'favorables': ScoreCultureSaisonSerializer(resultat['favorables'], many=True).data,
            'attention': ScoreCultureSaisonSerializer(resultat['attention'], many=True).data,
            'defavorables': ScoreCultureSaisonSerializer(resultat['defavorables'], many=True).data,
        })


class MettreAJourSaisonView(APIView):
    """
    Met à jour la saison
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        zone_id = request.data.get('zone_id')
        donnees = request.data.get('donnees', {})

        if not zone_id:
            return Response(
                {'error': 'zone_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            zone = ZoneAgricole.objects.get(id=zone_id)
        except ZoneAgricole.DoesNotExist:
            return Response(
                {'error': 'Zone non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        saison = SeasonService.mettre_a_jour_saison(zone_id, donnees)
        serializer = ProfilSaisonSerializer(saison)

        return Response(serializer.data)