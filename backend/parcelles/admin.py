from django.contrib import admin
from .models import Parcelle

@admin.register(Parcelle)
class ParcelleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'agriculteur', 'culture', 'superficie', 'date_semis', 'statut')
    list_filter = ('statut', 'culture', 'date_semis')
    search_fields = ('nom', 'agriculteur__first_name', 'agriculteur__last_name')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Informations générales', {
            'fields': ('agriculteur', 'nom', 'culture', 'variete', 'superficie')
        }),
        ('Localisation', {
            'fields': ('latitude', 'longitude')
        }),
        ('Suivi', {
            'fields': ('date_semis', 'date_recolte_prevue', 'statut', 'date_creation')
        }),
    )