from django.db import models
from django.conf import settings
from parcelles.models import Parcelle
from cultures.models import EtapeCulturelle

class ActionRealisee(models.Model):
    """
    Action réalisée sur une parcelle (historique)
    """
    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        related_name='actions_realisees'
    )
    etape = models.ForeignKey(
        EtapeCulturelle,
        on_delete=models.CASCADE
    )
    date_realisation = models.DateField(auto_now_add=True)
    commentaire = models.TextField(blank=True)
    realise_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='actions_realisees'
    )
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="GPS lors de l'action"
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="GPS lors de l'action"
    )

    class Meta:
        ordering = ['-date_realisation']
        verbose_name = "Action réalisée"
        verbose_name_plural = "Actions réalisées"

    def __str__(self):
        return f"{self.parcelle.nom} - {self.etape.nom} ({self.date_realisation})"


class NoteParcelle(models.Model):
    """
    Notes libres sur une parcelle (observations)
    """
    TYPE_CHOICES = [
        ('observation', 'Observation'),
        ('maladie', 'Maladie'),
        ('ravageur', 'Ravageur'),
        ('recolte', 'Récolte'),
        ('irrigation', 'Irrigation'),
        ('engrais', 'Engrais'),
        ('autre', 'Autre'),
    ]

    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='observation')
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='notes_parcelles'
    )
    image = models.ImageField(upload_to='notes/%Y/%m/%d/', blank=True, null=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Note"
        verbose_name_plural = "Notes"

    def __str__(self):
        return f"{self.parcelle.nom} - {self.titre[:30]}..."