# backend/notifications/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import NotificationService
from .serializers import NotificationSerializer

class NotificationsView(APIView):
    """
    Récupère les notifications de l'utilisateur
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Générer les notifications
        NotificationService.sauvegarder_notifications(request.user)

        # Récupérer les notifications
        notifications = NotificationService.obtenir_notifications(request.user)
        serializer = NotificationSerializer(notifications, many=True)

        return Response(serializer.data)

class NotificationsNonLuesView(APIView):
    """
    Récupère le nombre de notifications non lues
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Générer les notifications
        NotificationService.sauvegarder_notifications(request.user)

        non_lues = NotificationService.obtenir_non_lues(request.user)
        return Response({
            'total': non_lues.count()
        })

class MarquerLuesView(APIView):
    """
    Marque toutes les notifications comme lues
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        NotificationService.marquer_toutes_lues(request.user)
        return Response({
            'message': 'Toutes les notifications ont été marquées comme lues'
        })