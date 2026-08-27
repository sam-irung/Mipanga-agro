# backend/planification/serializers.py

from rest_framework import serializers
from .models import Calendrier
from cultures.serializers import EtapeCulturelleSerializer

class CalendrierSerializer(serializers.ModelSerializer):
    etape_details = EtapeCulturelleSerializer(source='etape', read_only=True)
    statut_label = serializers.SerializerMethodField()

    class Meta:
        model = Calendrier
        fields = [
            'id', 'parcelle', 'etape', 'etape_details',
            'date_prevue', 'date_originale', 'date_realisation',
            'statut', 'statut_label', 'report_count', 'raison_report',
            'est_ajustee', 'date_ajustement'
        ]

    def get_statut_label(self, obj):
        return dict(obj.STATUTS).get(obj.statut, obj.statut)