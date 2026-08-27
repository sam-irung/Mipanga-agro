# backend/ia/models.py

from django.db import models
from django.conf import settings
from parcelles.models import Parcelle

class AnalyseImage(models.Model):
    """
    Historique des analyses d'images
    """
    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        related_name='analyses_images'
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name='analyses_ia'
    )
    image = models.ImageField(upload_to='analyses/%Y/%m/%d/')
    resultat = models.JSONField(default=dict)
    
    # ✅ Nouveaux champs pour le suivi
    score_sante = models.IntegerField(default=0, help_text="Score de santé 0-100")
    niveau_risque = models.CharField(max_length=20, default='inconnu')
    conseils = models.TextField(blank=True)
    modele_utilise = models.CharField(max_length=50, default='gemini-2.0-flash')
    temps_execution = models.FloatField(default=0, help_text="Temps d'exécution en secondes")
    
    date_analyse = models.DateTimeField(auto_now_add=True)
    
    # ✅ Métadonnées météo au moment de l'analyse
    meteo_contexte = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-date_analyse']
        verbose_name = "Analyse d'image"
        verbose_name_plural = "Analyses d'images"

    def __str__(self):
        return f"{self.parcelle.nom} - {self.date_analyse.strftime('%d/%m/%Y %H:%M')}"