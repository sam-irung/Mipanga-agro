# backend/cultures/views.py

from rest_framework import viewsets, permissions
from .models import Culture
from .serializers import CultureSerializer, CultureListSerializer

class CultureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour consulter les cultures
    """
    queryset = Culture.objects.filter(active=True)
    serializer_class = CultureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return CultureListSerializer
        return CultureSerializer