# backend/saisons/serializers.py

from rest_framework import serializers
from .models import ProfilSaison, ScoreCultureSaison, RecommandationSaison
from cultures.serializers import CultureSerializer

class ProfilSaisonSerializer(serializers.ModelSerializer):
    zone_nom = serializers.CharField(source='zone.nom', read_only=True)

    class Meta:
        model = ProfilSaison
        fields = [
            'id', 'zone', 'zone_nom', 'nom', 'saison',
            'pluie_tendance', 'temperature_tendance', 'vent_tendance',
            'pluie_probabilite', 'debut_pluies_debut', 'debut_pluies_fin',
            'niveau_confiance', 'actif', 'date_creation', 'date_mise_a_jour'
        ]


class ScoreCultureSaisonSerializer(serializers.ModelSerializer):
    culture_details = CultureSerializer(source='culture', read_only=True)

    class Meta:
        model = ScoreCultureSaison
        fields = [
            'id', 'culture', 'culture_details',
            'score_pluie', 'score_temperature', 'score_global',
            'niveau', 'details', 'date_creation'
        ]


class RecommandationSaisonSerializer(serializers.ModelSerializer):
    culture_nom = serializers.CharField(source='culture.nom', read_only=True)

    class Meta:
        model = RecommandationSaison
        fields = ['id', 'culture', 'culture_nom', 'message', 'periode_semis_conseillee', 'varietes_conseillees', 'precautions', 'date_creation']