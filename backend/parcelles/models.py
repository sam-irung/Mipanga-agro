from django.db import models
from django.conf import settings
from cultures.models import Culture

class Parcelle(models.Model):
    STATUTS = [
        ('planifiee', 'Planifiée'),
        ('en_cours', 'En cours'),
        ('recoltee', 'Récoltée'),
        ('suspendue', 'Suspendue'),
    ]

    agriculteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parcelles'
    )
    nom = models.CharField(max_length=100)
    culture = models.ForeignKey(Culture, on_delete=models.PROTECT)
    variete = models.CharField(max_length=100, blank=True)
    superficie = models.DecimalField(max_digits=10, decimal_places=2, help_text="Superficie en hectares")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    date_semis = models.DateField()
    date_recolte_prevue = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='planifiee')
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Parcelle"
        verbose_name_plural = "Parcelles"

    def __str__(self):
        return f"{self.nom} - {self.culture.nom} ({self.agriculteur.first_name})"

    def age(self):
        """Retourne l'âge de la culture en jours"""
        from datetime import date
        return (date.today() - self.date_semis).days

    def progression(self):
        """
        Retourne le pourcentage de progression
        TODO: Sera implémenté dans le Module 5 (Planification)
        """
        return 0