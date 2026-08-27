# backend/saisons/urls.py

from django.urls import path
from .views import SaisonActuelleView, CulturesRecommandeesView, MettreAJourSaisonView

urlpatterns = [
    path('actuelle/', SaisonActuelleView.as_view(), name='saison-actuelle'),
    path('recommandations/', CulturesRecommandeesView.as_view(), name='cultures-recommandees'),
    path('mettre-a-jour/', MettreAJourSaisonView.as_view(), name='mettre-a-jour-saison'),
]