# backend/parcelles/views.py

from rest_framework import viewsets, permissions
from .models import Parcelle
from .serializers import ParcelleSerializer
from planification.services import CalendrierService  # ✅ IMPORT

class ParcelleViewSet(viewsets.ModelViewSet):
    serializer_class = ParcelleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Parcelle.objects.filter(agriculteur=self.request.user)

    def perform_create(self, serializer):
        parcelle = serializer.save(agriculteur=self.request.user)
        # ✅ Générer automatiquement le calendrier
        CalendrierService.creer_calendrier(parcelle)