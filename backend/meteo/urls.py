# backend/meteo/urls.py

from django.urls import path
from .views import MeteoView, ParcelleMeteoView

urlpatterns = [
    path('', MeteoView.as_view(), name='meteo'),
    path('parcelle/<int:parcelle_id>/', ParcelleMeteoView.as_view(), name='parcelle-meteo'),
]