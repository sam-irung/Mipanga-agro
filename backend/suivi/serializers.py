from rest_framework import serializers
from .models import ActionRealisee, NoteParcelle
from cultures.serializers import EtapeCulturelleSerializer

class ActionRealiseeSerializer(serializers.ModelSerializer):
    etape_details = EtapeCulturelleSerializer(source='etape', read_only=True)
    realise_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = ActionRealisee
        fields = ['id', 'parcelle', 'etape', 'etape_details',
                  'date_realisation', 'commentaire', 'realise_par',
                  'realise_par_nom', 'latitude', 'longitude']

    def get_realise_par_nom(self, obj):
        if obj.realise_par:
            return f"{obj.realise_par.first_name} {obj.realise_par.last_name}"
        return None

class NoteParcelleSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = NoteParcelle
        fields = ['id', 'parcelle', 'type', 'titre', 'contenu',
                  'date', 'auteur', 'auteur_nom', 'image']

    def get_auteur_nom(self, obj):
        if obj.auteur:
            return f"{obj.auteur.first_name} {obj.auteur.last_name}"
        return None