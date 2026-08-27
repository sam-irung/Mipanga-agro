from rest_framework import serializers
from .models import Parcelle
from cultures.serializers import CultureSerializer

class ParcelleSerializer(serializers.ModelSerializer):
    culture_details = CultureSerializer(source='culture', read_only=True)
    agriculteur_nom = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    progression = serializers.SerializerMethodField()

    class Meta:
        model = Parcelle
        fields = [
            'id', 'nom', 'culture', 'culture_details', 'variete',
            'superficie', 'latitude', 'longitude', 'date_semis',
            'date_recolte_prevue', 'statut', 'date_creation',
            'agriculteur', 'agriculteur_nom', 'age', 'progression'
        ]
        read_only_fields = ['agriculteur', 'date_creation']
        extra_kwargs = {
            'latitude': {'required': False, 'allow_null': True},
            'longitude': {'required': False, 'allow_null': True},
        }
    def get_agriculteur_nom(self, obj):
        return f"{obj.agriculteur.first_name} {obj.agriculteur.last_name}"

    def get_age(self, obj):
        return obj.age()

    def get_progression(self, obj):
        return obj.progression()