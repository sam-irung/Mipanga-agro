# backend/recommandations/admin.py

from django.contrib import admin
from .models import RegleAgronomique, Recommandation, HistoriqueRecommandation

@admin.register(RegleAgronomique)
class RegleAgronomiqueAdmin(admin.ModelAdmin):
    list_display = ('conseil', 'culture', 'etape', 'niveau', 'source', 'active')
    list_filter = ('culture', 'niveau', 'source', 'active')
    search_fields = ('conseil',)
    fieldsets = (
        ('Informations générales', {
            'fields': ('culture', 'etape', 'conditions')
        }),
        ('Contenu', {
            'fields': ('conseil', 'solution', 'source', 'niveau', 'priorite')
        }),
        ('Statut', {
            'fields': ('active',)
        }),
    )


@admin.register(Recommandation)
class RecommandationAdmin(admin.ModelAdmin):
    list_display = ('parcelle', 'titre', 'niveau', 'date', 'lue', 'appliquee', 'active')
    list_filter = ('niveau', 'source', 'lue', 'appliquee', 'active')
    search_fields = ('message', 'titre', 'parcelle__nom')
    readonly_fields = ('date',)


@admin.register(HistoriqueRecommandation)
class HistoriqueRecommandationAdmin(admin.ModelAdmin):
    list_display = ('recommandation', 'champ', 'date_modification')
    list_filter = ('champ',)
    search_fields = ('recommandation__message',)
    readonly_fields = ('date_modification',)