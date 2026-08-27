# backend/planification/models.py

from django.db import models
from django.utils import timezone
from datetime import date
from parcelles.models import Parcelle
from cultures.models import EtapeCulturelle

class Calendrier(models.Model):
    STATUTS = [
        ('a_venir', 'À venir'),
        ('realise', 'Réalisé'),
        ('en_retard', 'En retard'),
        ('annule', 'Annulé'),
        ('reporte', 'Reporté'),
    ]

    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        related_name='calendrier'
    )
    etape = models.ForeignKey(
        EtapeCulturelle,
        on_delete=models.CASCADE
    )
    date_prevue = models.DateField()
    date_originale = models.DateField(
        default=timezone.now,
        help_text="Date initiale sans ajustement"
    )
    date_realisation = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='a_venir')
    
    report_count = models.IntegerField(default=0, help_text="Nombre de fois que l'étape a été reportée")
    raison_report = models.TextField(blank=True, help_text="Raison du report")
    est_ajustee = models.BooleanField(default=False, help_text="La date a-t-elle été ajustée ?")
    date_ajustement = models.DateTimeField(null=True, blank=True, help_text="Date du dernier ajustement")

    class Meta:
        ordering = ['date_prevue']
        unique_together = ['parcelle', 'etape']
        verbose_name = "Calendrier"
        verbose_name_plural = "Calendriers"

    def __str__(self):
        return f"{self.parcelle.nom} - {self.etape.nom} ({self.date_prevue})"

    def mettre_a_jour_statut(self):
        """Met à jour le statut automatiquement"""
        if self.statut in ['annule', 'realise']:
            return

        if self.date_prevue < date.today():
            self.statut = 'en_retard'
        else:
            self.statut = 'a_venir'
        self.save()

    def reporter(self, nouvelle_date: date, raison: str = ""):
        """Reporte une étape à une nouvelle date"""
        self.date_originale = self.date_prevue
        self.date_prevue = nouvelle_date
        self.report_count += 1
        self.raison_report = raison
        self.est_ajustee = True
        self.statut = 'reporte'
        self.save()

    def ajuster(self, nouvelle_date: date, raison: str = ""):
        """Ajuste la date d'une étape sans la marquer comme reportée"""
        self.date_originale = self.date_prevue
        self.date_prevue = nouvelle_date
        self.est_ajustee = True
        self.date_ajustement = timezone.now()
        self.raison_report = raison
        self.save()