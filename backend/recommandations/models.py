# backend/recommandations/models.py

from django.db import models
from django.conf import settings
from cultures.models import Culture, EtapeCulturelle
from parcelles.models import Parcelle

class RegleAgronomique(models.Model):
    """
    Règle métier pour générer des recommandations
    """
    # ✅ Niveaux de priorité plus explicites
    NIVEAUX = [
        ('critique', '🔴 Critique'),
        ('important', '🟠 Important'),
        ('conseil', '🟢 Conseil'),
    ]

    # ✅ Sources étendues
    SOURCES = [
        ('meteo', 'Météo'),
        ('calendrier', 'Calendrier'),
        ('regle', 'Règle agronomique'),
        ('retard', 'Retard'),
    ]

    culture = models.ForeignKey(
        Culture,
        on_delete=models.CASCADE,
        related_name='regles'
    )
    etape = models.ForeignKey(
        EtapeCulturelle,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='regles'
    )
    conditions = models.JSONField(
        help_text='Ex: {"pluie": ">20", "jours_sans_pluie": ">7", "temp_max": ">35", "retard": ">5"}'
    )
    conseil = models.TextField(help_text="Message de recommandation")
    # ✅ Ajout du champ solution
    solution = models.TextField(
        blank=True, 
        help_text="Solution recommandée pour l'agriculteur"
    )
    source = models.CharField(max_length=20, choices=SOURCES, default='regle')
    niveau = models.CharField(max_length=20, choices=NIVEAUX, default='conseil')
    priorite = models.IntegerField(default=2, help_text="1=Haute, 2=Moyenne, 3=Basse")
    active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priorite', '-date_creation']
        verbose_name = "Règle agronomique"
        verbose_name_plural = "Règles agronomiques"

    def __str__(self):
        return f"{self.culture.nom} - {self.conseil[:50]}..."


class Recommandation(models.Model):
    """
    Recommandation générée pour une parcelle
    """
    # ✅ Niveaux de priorité alignés avec RegleAgronomique
    NIVEAUX = [
        ('critique', '🔴 Critique'),
        ('important', '🟠 Important'),
        ('conseil', '🟢 Conseil'),
    ]

    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        related_name='recommandations'
    )
    regle = models.ForeignKey(
        RegleAgronomique,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    # ✅ Ajout du titre pour un affichage plus clair
    titre = models.CharField(max_length=200, blank=True, help_text="Titre de la recommandation")
    message = models.TextField(help_text="Message détaillé")
    # ✅ Ajout de la solution
    solution = models.TextField(blank=True, help_text="Solution proposée")
    niveau = models.CharField(max_length=20, choices=NIVEAUX)
    source = models.CharField(max_length=20, choices=RegleAgronomique.SOURCES)
    date = models.DateTimeField(auto_now_add=True)
    lue = models.BooleanField(default=False, help_text="L'utilisateur a-t-il lu cette recommandation ?")
    appliquee = models.BooleanField(default=False, help_text="L'utilisateur a-t-il appliqué cette recommandation ?")
    active = models.BooleanField(default=True, help_text="La recommandation est-elle toujours active ?")
    # ✅ Ajout du contexte pour traçabilité
    contexte = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Contexte au moment de la génération (météo, âge, statut, etc.)"
    )

    class Meta:
        ordering = ['-date']
        verbose_name = "Recommandation"
        verbose_name_plural = "Recommandations"

    def __str__(self):
        return f"{self.parcelle.nom} - {self.titre[:50] if self.titre else self.message[:50]}..."


class HistoriqueRecommandation(models.Model):
    """
    Historique des modifications des recommandations
    """
    recommandation = models.ForeignKey(
        Recommandation,
        on_delete=models.CASCADE,
        related_name='historique'
    )
    champ = models.CharField(max_length=50)
    ancienne_valeur = models.JSONField(null=True, blank=True)
    nouvelle_valeur = models.JSONField(null=True, blank=True)
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    date_modification = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_modification']
        verbose_name = "Historique recommandation"
        verbose_name_plural = "Historiques recommandations"

    def __str__(self):
        return f"{self.recommandation.pk} - {self.champ} - {self.date_modification}"