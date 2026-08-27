# backend/cultures/admin.py

from django.contrib import admin
from .models import (
    Culture, Variete, ZoneAgricole, CalendrierZone,
    EtapeCulturelle, ProfilClimatique, SourceAgronomique
)

class VarieteInline(admin.TabularInline):
    model = Variete
    extra = 1

class EtapeInline(admin.TabularInline):
    model = EtapeCulturelle
    extra = 1

class CalendrierZoneInline(admin.TabularInline):
    model = CalendrierZone
    extra = 1


@admin.register(Culture)
class CultureAdmin(admin.ModelAdmin):
    list_display = ('emoji', 'nom', 'type', 'duree_min', 'duree_max', 'active')
    list_filter = ('type', 'active')
    search_fields = ('nom',)
    inlines = [VarieteInline, EtapeInline, CalendrierZoneInline]


@admin.register(Variete)
class VarieteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'culture', 'duree_min', 'duree_max', 'active')
    list_filter = ('culture', 'active')


@admin.register(ZoneAgricole)
class ZoneAgricoleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'province', 'territoire')
    list_filter = ('province',)


@admin.register(CalendrierZone)
class CalendrierZoneAdmin(admin.ModelAdmin):
    list_display = ('culture', 'zone', 'saison', 'semis_debut_jour', 'semis_fin_jour')
    list_filter = ('culture', 'zone', 'saison')


@admin.register(EtapeCulturelle)
class EtapeCulturelleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'culture', 'type_etape', 'decalage_min', 'decalage_max', 'ordre')
    list_filter = ('culture', 'type_etape')


# ✅ CORRIGÉ - Utiliser les bons champs
@admin.register(ProfilClimatique)
class ProfilClimatiqueAdmin(admin.ModelAdmin):
    list_display = ('culture', 'temp_min', 'temp_opt_min', 'temp_opt_max', 'temp_max', 'niveau_confiance')
    list_filter = ('culture', 'niveau_confiance')
    search_fields = ('culture__nom',)
    fieldsets = (
        ('Température', {
            'fields': ('temp_min', 'temp_opt_min', 'temp_opt_max', 'temp_max')
        }),
        ('Eau', {
            'fields': ('besoin_eau_min', 'besoin_eau_max', 'tolerance_secheresse', 'tolerance_exces_eau')
        }),
        ('Sources', {
            'fields': ('source', 'source_url', 'niveau_confiance', 'date_verification')
        }),
    )


@admin.register(SourceAgronomique)
class SourceAgronomiqueAdmin(admin.ModelAdmin):
    list_display = ('titre', 'organisation', 'annee')