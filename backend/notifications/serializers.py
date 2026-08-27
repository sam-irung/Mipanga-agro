# backend/notifications/serializers.py

from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    type_label = serializers.SerializerMethodField()
    parcelle_nom = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'titre', 'message', 'type', 'type_label',
            'parcelle', 'parcelle_nom', 'lien', 'lue', 'date_creation'
        ]

    def get_type_label(self, obj):
        return dict(obj.TYPES).get(obj.type, obj.type)

    def get_parcelle_nom(self, obj):
        return obj.parcelle.nom if obj.parcelle else None