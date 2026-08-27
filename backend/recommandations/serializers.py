# backend/recommandations/serializers.py

from rest_framework import serializers
from .models import RegleAgronomique, Recommandation, HistoriqueRecommandation
from cultures.serializers import CultureSerializer, EtapeCulturelleSerializer

class RegleAgronomiqueSerializer(serializers.ModelSerializer):
    culture_details = CultureSerializer(source='culture', read_only=True)
    etape_details = EtapeCulturelleSerializer(source='etape', read_only=True)
    niveau_label = serializers.SerializerMethodField()
    source_label = serializers.SerializerMethodField()

    class Meta:
        model = RegleAgronomique
        fields = [
            'id', 'culture', 'culture_details', 'etape', 'etape_details',
            'conditions', 'conseil', 'solution', 'source', 'source_label',
            'niveau', 'niveau_label', 'priorite', 'active', 'date_creation'
        ]

    def get_niveau_label(self, obj):
        return dict(obj.NIVEAUX).get(obj.niveau, obj.niveau)

    def get_source_label(self, obj):
        return dict(obj.SOURCES).get(obj.source, obj.source)


class RecommandationSerializer(serializers.ModelSerializer):
    niveau_label = serializers.SerializerMethodField()
    source_label = serializers.SerializerMethodField()
    parcelle_nom = serializers.SerializerMethodField()

    class Meta:
        model = Recommandation
        fields = [
            'id', 'parcelle', 'parcelle_nom', 'regle', 'titre',
            'message', 'solution', 'niveau', 'niveau_label',
            'source', 'source_label', 'date', 'lue', 'appliquee',
            'active', 'contexte'
        ]

    def get_niveau_label(self, obj):
        return dict(obj.NIVEAUX).get(obj.niveau, obj.niveau)

    def get_source_label(self, obj):
        return dict(RegleAgronomique.SOURCES).get(obj.source, obj.source)

    def get_parcelle_nom(self, obj):
        return obj.parcelle.nom


class HistoriqueRecommandationSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.SerializerMethodField()

    class Meta:
        model = HistoriqueRecommandation
        fields = [
            'id', 'recommandation', 'champ', 'ancienne_valeur',
            'nouvelle_valeur', 'utilisateur', 'utilisateur_nom',
            'date_modification'
        ]

    def get_utilisateur_nom(self, obj):
        if obj.utilisateur:
            return f"{obj.utilisateur.first_name} {obj.utilisateur.last_name}"
        return None