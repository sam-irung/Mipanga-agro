# backend/cultures/serializers.py

from rest_framework import serializers
from .models import (
    Culture,
    Variete,
    ZoneAgricole,
    CalendrierZone,  # ✅ Renommé
    EtapeCulturelle,
    ProfilClimatique,
    SourceAgronomique
)

class VarieteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variete
        fields = ['id', 'nom', 'duree_min', 'duree_max', 'description', 'active', 'source']


class ZoneAgricoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZoneAgricole
        fields = ['id', 'nom', 'province', 'territoire', 'latitude', 'longitude']


class CalendrierZoneSerializer(serializers.ModelSerializer):
    zone_nom = serializers.CharField(source='zone.nom', read_only=True)

    class Meta:
        model = CalendrierZone
        fields = ['id', 'zone', 'zone_nom', 'saison', 'semis_debut_jour', 'semis_fin_jour', 'recolte_debut_jour', 'recolte_fin_jour', 'source', 'niveau_confiance']


class EtapeCulturelleSerializer(serializers.ModelSerializer):
    type_label = serializers.SerializerMethodField()

    class Meta:
        model = EtapeCulturelle
        fields = ['id', 'nom', 'type_etape', 'type_label', 'decalage_min', 'decalage_max', 'description', 'ordre', 'obligatoire', 'source']

    def get_type_label(self, obj):
        return dict(obj.TYPES).get(obj.type_etape, obj.type_etape)


class ProfilClimatiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilClimatique
        fields = ['id', 'pluie_min', 'pluie_max', 'pluie_optimum', 'temp_min', 'temp_max', 'temp_optimum', 'altitude_min', 'altitude_max', 'jours_secheresse_toleres', 'source', 'niveau_confiance']


class CultureSerializer(serializers.ModelSerializer):
    varietes = VarieteSerializer(many=True, read_only=True)
    etapes = EtapeCulturelleSerializer(many=True, read_only=True)
    calendriers_zone = CalendrierZoneSerializer(many=True, read_only=True)
    profils_climatiques = ProfilClimatiqueSerializer(many=True, read_only=True)

    class Meta:
        model = Culture
        fields = [
            'id', 'nom', 'type', 'nom_scientifique', 'description', 'emoji',
            'duree_min', 'duree_max',
            'temperature_min', 'temperature_optimum', 'temperature_max',
            'besoin_eau_min', 'besoin_eau_max',
            'tolerance_exces_eau', 'tolerance_secheresse',
            'active', 'date_creation',
            'varietes', 'etapes', 'calendriers_zone', 'profils_climatiques'
        ]


class CultureListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Culture
        fields = ['id', 'nom', 'emoji', 'type', 'description', 'active']