# backend/saisons/admin.py

from django.contrib import admin
from .models import ProfilSaison, ScoreCultureSaison, RecommandationSaison

@admin.register(ProfilSaison)
class ProfilSaisonAdmin(admin.ModelAdmin):
    list_display = ('zone', 'nom', 'pluie_tendance', 'temperature_tendance', 'actif')
    list_filter = ('zone', 'pluie_tendance', 'actif')

@admin.register(ScoreCultureSaison)
class ScoreCultureSaisonAdmin(admin.ModelAdmin):
    list_display = ('profil_saison', 'culture', 'score_global', 'niveau')
    list_filter = ('niveau', 'culture')

@admin.register(RecommandationSaison)
class RecommandationSaisonAdmin(admin.ModelAdmin):
    list_display = ('profil_saison', 'culture', 'date_creation')