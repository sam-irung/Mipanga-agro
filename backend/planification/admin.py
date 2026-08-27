from django.contrib import admin
from .models import Calendrier

@admin.register(Calendrier)
class CalendrierAdmin(admin.ModelAdmin):
    list_display = ('parcelle', 'etape', 'date_prevue', 'statut')
    list_filter = ('statut', 'parcelle__culture')
    search_fields = ('parcelle__nom', 'etape__nom')
    readonly_fields = ('date_prevue',)
    fieldsets = (
        ('Informations', {
            'fields': ('parcelle', 'etape', 'date_prevue')
        }),
        ('Suivi', {
            'fields': ('statut', 'date_realisation')
        }),
    )