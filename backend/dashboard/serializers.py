# backend/dashboard/serializers.py

from rest_framework import serializers

class DashboardSerializer(serializers.Serializer):
    resume = serializers.DictField()
    parcelles = serializers.ListField()
    calendrier = serializers.DictField()
    recommandations = serializers.ListField()
    activites = serializers.ListField()
    statistiques = serializers.DictField()
    alerte_meteo = serializers.ListField()
    ia = serializers.DictField()  # ✅ AJOUTER