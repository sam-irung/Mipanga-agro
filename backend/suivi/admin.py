from django.contrib import admin
from .models import ActionRealisee, NoteParcelle

@admin.register(ActionRealisee)
class ActionRealiseeAdmin(admin.ModelAdmin):
    list_display = ('parcelle', 'etape', 'date_realisation', 'realise_par')
    list_filter = ('date_realisation', 'parcelle__culture')
    search_fields = ('parcelle__nom', 'etape__nom', 'commentaire')
    readonly_fields = ('date_realisation',)

@admin.register(NoteParcelle)
class NoteParcelleAdmin(admin.ModelAdmin):
    list_display = ('parcelle', 'type', 'titre', 'date', 'auteur')
    list_filter = ('type', 'date')
    search_fields = ('titre', 'contenu', 'parcelle__nom')
    readonly_fields = ('date',)