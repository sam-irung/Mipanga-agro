# backend/saisons/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from cultures.models import Culture, ZoneAgricole

class ProfilSaison(models.Model):
    """
    Profil climatique de la saison agricole
    """
    TENDANCES = [
        ('au_dessus', 'Au-dessus de la normale'),
        ('normal', 'Normal'),
        ('en_dessous', 'En dessous de la normale'),
    ]

    zone = models.ForeignKey(
        ZoneAgricole,
        on_delete=models.CASCADE,
        related_name='profils_saison'
    )
    nom = models.CharField(max_length=100, help_text="Ex: Saison agricole 2026-2027")
    saison = models.CharField(max_length=1, choices=[('A', 'Saison A'), ('B', 'Saison B')])
    source = models.CharField(max_length=255, blank=True, help_text="Source des données météo")
    
    # Tendances
    pluie_tendance = models.CharField(max_length=20, choices=TENDANCES)
    temperature_tendance = models.CharField(max_length=20, choices=TENDANCES)
    vent_tendance = models.CharField(max_length=20, choices=TENDANCES)

    # Probabilité (0-100)
    pluie_probabilite = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True, blank=True
    )

    # Début des pluies (fenêtre estimée)
    debut_pluies_debut = models.DateField(null=True, blank=True)
    debut_pluies_fin = models.DateField(null=True, blank=True)

    # Confiance
    niveau_confiance = models.CharField(
        max_length=20,
        choices=[('faible', 'Faible'), ('moyen', 'Moyen'), ('eleve', 'Élevé')],
        default='moyen'
    )

    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Profil de saison"
        verbose_name_plural = "Profils de saison"

    def __str__(self):
        return f"{self.zone.nom} - {self.nom}"


class ScoreCultureSaison(models.Model):
    """
    Score d'adéquation d'une culture pour une saison
    """
    NIVEAUX = [
        ('favorable', '🟢 Favorable'),
        ('attention', '🟡 Avec précautions'),
        ('defavorable', '🔴 Défavorable'),
    ]

    profil_saison = models.ForeignKey(
        ProfilSaison,
        on_delete=models.CASCADE,
        related_name='scores_cultures'
    )
    culture = models.ForeignKey(
        Culture,
        on_delete=models.CASCADE,
        related_name='scores_saison'
    )

    score_pluie = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_temperature = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    score_global = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])

    niveau = models.CharField(max_length=20, choices=NIVEAUX)
    details = models.JSONField(default=dict, blank=True)

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score_global']
        unique_together = ['profil_saison', 'culture']
        verbose_name = "Score culture-saison"

    def __str__(self):
        return f"{self.culture.nom} - {self.score_global}%"


class RecommandationSaison(models.Model):
    """
    Recommandation détaillée pour une culture
    """
    profil_saison = models.ForeignKey(
        ProfilSaison,
        on_delete=models.CASCADE,
        related_name='recommandations'
    )
    culture = models.ForeignKey(Culture, on_delete=models.CASCADE)

    message = models.TextField()
    periode_semis_conseillee = models.CharField(max_length=200, blank=True)
    varietes_conseillees = models.TextField(blank=True)
    precautions = models.TextField(blank=True)

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Recommandation de saison"

    def __str__(self):
        return f"{self.culture.nom} - {self.profil_saison.nom}"