from django.contrib.auth.models import AbstractUser
from django.db import models

class Utilisateur(AbstractUser):
    """
    Modèle utilisateur personnalisé pour Mipanga Agro
    """
    telephone = models.CharField(max_length=20, unique=True)
    province = models.CharField(max_length=100)
    territoire = models.CharField(max_length=100)
    date_inscription = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'telephone'  # ← Important
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'province', 'territoire']
    # On garde username comme identifiant pour l'admin
    # Le téléphone est obligatoire et unique mais pas utilisé pour l'auth

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.telephone})"

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"