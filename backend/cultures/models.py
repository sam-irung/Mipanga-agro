# backend/cultures/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Culture(models.Model):
    """
    Culture de base
    """
    TYPES = [
        ('cereale', 'Céréale'),
        ('tubercule', 'Tubercule'),
        ('legumineuse', 'Légumineuse'),
        ('maraicher', 'Maraîcher'),
        ('oleagineux', 'Oléagineux'),
    ]

    nom = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=20, choices=TYPES)
    nom_scientifique = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    emoji = models.CharField(max_length=10, default="🌱")

    # Caractéristiques générales
    duree_min = models.PositiveIntegerField(help_text="Durée minimale du cycle en jours")
    duree_max = models.PositiveIntegerField(help_text="Durée maximale du cycle en jours")

    temperature_min = models.FloatField(default=10, help_text="Température minimale °C")
    temperature_optimum = models.FloatField(default=25, help_text="Température optimale °C")
    temperature_max = models.FloatField(default=35, help_text="Température maximale °C")

    besoin_eau_min = models.FloatField(
        default=300,
        validators=[MinValueValidator(0)],
        help_text="Besoins en eau minimum en mm/cycle"
    )
    besoin_eau_max = models.FloatField(
        default=800,
        validators=[MinValueValidator(0)],
        help_text="Besoins en eau maximum en mm/cycle"
    )

    tolerance_exces_eau = models.IntegerField(
        choices=[(1, 'Faible'), (2, 'Moyenne'), (3, 'Élevée')],
        default=2
    )
    tolerance_secheresse = models.IntegerField(
        choices=[(1, 'Faible'), (2, 'Moyenne'), (3, 'Élevée')],
        default=2
    )

    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Culture"
        verbose_name_plural = "Cultures"

    def __str__(self):
        return f"{self.emoji} {self.nom}"

    def duree_moyenne(self):
        return (self.duree_min + self.duree_max) // 2


class Variete(models.Model):
    """
    Variété d'une culture
    """
    culture = models.ForeignKey(Culture, on_delete=models.CASCADE, related_name='varietes')
    nom = models.CharField(max_length=100)
    duree_min = models.PositiveIntegerField(help_text="Durée minimale en jours")
    duree_max = models.PositiveIntegerField(help_text="Durée maximale en jours")
    description = models.TextField(blank=True)
    source = models.CharField(max_length=255, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Variété"
        verbose_name_plural = "Variétés"
        unique_together = ['culture', 'nom']

    def __str__(self):
        return f"{self.culture.nom} - {self.nom} ({self.duree_min}-{self.duree_max}j)"


class ZoneAgricole(models.Model):
    """
    Zone agricole avec localisation
    """
    nom = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    territoire = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    class Meta:
        ordering = ['province', 'nom']
        verbose_name = "Zone agricole"
        verbose_name_plural = "Zones agricoles"

    def __str__(self):
        return f"{self.nom} - {self.province}"


class CalendrierZone(models.Model):
    """
    Calendrier cultural par zone
    """
    SAISONS = [
        ('A', 'Saison A'),
        ('B', 'Saison B'),
    ]

    culture = models.ForeignKey(Culture, on_delete=models.CASCADE, related_name='calendriers_zone')
    zone = models.ForeignKey(ZoneAgricole, on_delete=models.CASCADE, related_name='calendriers')
    saison = models.CharField(max_length=1, choices=SAISONS)

    semis_debut_jour = models.IntegerField(help_text="Jour de l'année (1-365)")
    semis_fin_jour = models.IntegerField(help_text="Jour de l'année (1-365)")
    recolte_debut_jour = models.IntegerField(help_text="Jour de l'année (1-365)")
    recolte_fin_jour = models.IntegerField(help_text="Jour de l'année (1-365)")

    source = models.CharField(max_length=255, blank=True)
    niveau_confiance = models.CharField(
        max_length=20,
        choices=[('faible', 'Faible'), ('moyen', 'Moyen'), ('eleve', 'Élevé')],
        default='moyen'
    )
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ['culture__nom', 'zone__province']
        verbose_name = "Calendrier par zone"
        verbose_name_plural = "Calendriers par zone"
        unique_together = ['culture', 'zone', 'saison']

    def __str__(self):
        return f"{self.culture.nom} - {self.zone.nom} - Saison {self.saison}"


class EtapeCulturelle(models.Model):
    """
    Étapes culturales
    """
    TYPES = [
        ('preparation', 'Préparation'),
        ('semis', 'Semis'),
        ('entretien', 'Entretien'),
        ('fertilisation', 'Fertilisation'),
        ('traitement', 'Traitement'),
        ('surveillance', 'Surveillance'),
        ('recolte', 'Récolte'),
    ]

    culture = models.ForeignKey(Culture, on_delete=models.CASCADE, related_name='etapes')
    nom = models.CharField(max_length=150)
    type_etape = models.CharField(max_length=30, choices=TYPES)

    # ✅ Utiliser IntegerField pour autoriser les valeurs négatives
    decalage_min = models.IntegerField(help_text="Décalage minimum en jours (peut être négatif)")
    decalage_max = models.IntegerField(help_text="Décalage maximum en jours (peut être négatif)")

    description = models.TextField(blank=True)
    ordre = models.PositiveIntegerField(default=0)
    obligatoire = models.BooleanField(default=True)
    source = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['ordre', 'decalage_min']
        verbose_name = "Étape culturelle"
        verbose_name_plural = "Étapes culturales"
        unique_together = ['culture', 'ordre']

    def __str__(self):
        return f"{self.culture.nom} - {self.nom} (J{self.decalage_min}-{self.decalage_max})"

class ProfilClimatique(models.Model):
    """
    Profil climatique d'une culture avec sources vérifiées
    """
    culture = models.OneToOneField(
        Culture,
        on_delete=models.CASCADE,
        related_name='profil_climatique'
    )

    # Température
    temp_min = models.FloatField(help_text="Température minimale °C")
    temp_opt_min = models.FloatField(help_text="Température optimale minimale °C")
    temp_opt_max = models.FloatField(help_text="Température optimale maximale °C")
    temp_max = models.FloatField(help_text="Température maximale °C")

    # Besoin en eau (sur le cycle complet)
    besoin_eau_min = models.FloatField(help_text="Besoin en eau minimum mm/cycle")
    besoin_eau_max = models.FloatField(help_text="Besoin en eau maximum mm/cycle")

    # Tolérances
    tolerance_secheresse = models.IntegerField(
        choices=[(1, 'Faible'), (2, 'Moyenne'), (3, 'Élevée')],
        default=2
    )
    tolerance_exces_eau = models.IntegerField(
        choices=[(1, 'Faible'), (2, 'Moyenne'), (3, 'Élevée')],
        default=2
    )

    # Sources
    source = models.CharField(max_length=255, blank=True)
    source_url = models.URLField(blank=True)
    niveau_confiance = models.CharField(
        max_length=20,
        choices=[('faible', 'Faible'), ('moyen', 'Moyen'), ('eleve', 'Élevé')],
        default='moyen'
    )
    date_verification = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.culture.nom} - Profil climatique"


class SourceAgronomique(models.Model):
    """
    Références documentaires vérifiées
    """
    titre = models.CharField(max_length=255)
    organisation = models.CharField(max_length=200)
    auteur = models.CharField(max_length=200, blank=True)
    annee = models.IntegerField()
    url = models.URLField(blank=True)
    date_consultation = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-annee']
        verbose_name = "Source agronomique"
        verbose_name_plural = "Sources agronomiques"

    def __str__(self):
        return f"{self.titre} ({self.annee}) - {self.organisation}"