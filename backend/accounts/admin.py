from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur

class UtilisateurAdmin(UserAdmin):
    list_display = ('telephone', 'first_name', 'last_name', 'province', 'date_inscription')
    search_fields = ('telephone', 'first_name', 'last_name')
    list_filter = ('province', 'date_inscription')

    # ✅ Retirer date_inscription des champs modifiables
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'email', 'telephone')}),
        ('Localisation', {'fields': ('province', 'territoire')}),
        # date_inscription est auto-rempli, on ne le met pas ici
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'telephone', 'email', 'province', 'territoire', 'password1', 'password2'),
        }),
    )
    
    # ✅ Marquer date_inscription comme lecture seule
    readonly_fields = ('date_inscription',)

admin.site.register(Utilisateur, UtilisateurAdmin)