# backend/ia/urls.py

from django.urls import path
from .views import AnalyseParcelleView, AnalyseImageView, HistoriqueAnalysesView, ChatIAView

urlpatterns = [
    path('analyser/', AnalyseParcelleView.as_view(), name='analyse-parcelle'),
    path('analyser-image/', AnalyseImageView.as_view(), name='analyse-image'),
    path('historique/', HistoriqueAnalysesView.as_view(), name='historique-analyses'),
    path('chat/', ChatIAView.as_view(), name='chat-ia'),
]