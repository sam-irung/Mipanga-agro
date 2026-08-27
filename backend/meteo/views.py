# backend/meteo/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import WeatherService
from parcelles.models import Parcelle

class MeteoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parcelle_id = request.query_params.get('parcelle_id')
        jours = int(request.query_params.get('jours', 7))

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=400
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=404
            )

        if not parcelle.latitude or not parcelle.longitude:
            return Response(
                {'error': 'Coordonnées GPS manquantes pour cette parcelle'},
                status=400
            )

        data = WeatherService.get_resume_meteo(parcelle, jours)

        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=503)

        return Response(data)


class ParcelleMeteoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, parcelle_id):
        """
        Récupère la météo pour une parcelle spécifique
        """
        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=404
            )

        if not parcelle.latitude or not parcelle.longitude:
            return Response(
                {'error': 'Coordonnées GPS manquantes pour cette parcelle'},
                status=400
            )

        data = WeatherService.get_resume_meteo(parcelle, jours=7)

        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=503)

        return Response(data)