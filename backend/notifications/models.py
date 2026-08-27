# backend/notifications/models.py

from django.db import models
from django.conf import settings
from parcelles.models import Parcelle

class Notification(models.Model):
    """
    Notifications pour l'agriculteur
    """
    TYPES = [
        ('alerte', '🔴 Alerte'),
        ('info', '🟢 Information'),
        ('rappel', '🟡 Rappel'),
        ('ia', '🧠 IA'),
        ('meteo', '🌤 Météo'),
    ]

    agriculteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=TYPES, default='info')
    titre = models.CharField(max_length=200)
    message = models.TextField()
    lien = models.CharField(max_length=200, blank=True, help_text="Lien vers la page concernée")
    lue = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.titre} - {self.agriculteur.first_name}"

    def marquer_lue(self):
        self.lue = True
        self.save()