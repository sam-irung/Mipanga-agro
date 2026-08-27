from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import DashboardService

class DashboardView(APIView):
    """
    API pour récupérer toutes les données du dashboard
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = DashboardService.get_dashboard_data(request.user)
        return Response(data)