# backend/create_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mipanga_agro.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

def create_admin():
    try:
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(telephone='+243971268236').exists():
            print("✅ Superuser existe déjà")
            return
        
        # Créer le superutilisateur avec TOUS les champs
        User.objects.create_superuser(
            telephone='+243971268236',
            username='admin',
            first_name='Admin',
            last_name='Mipanga',
            email='admin@mipanga.com',
            password='Mipanga2025!',
            province='Lubumbashi',
            territoire='Lubumbashi'
        )
        print("✅ Superuser créé avec succès")
        print("   Téléphone: +243971268236")
        print("   Mot de passe: Mipanga2025!")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise

if __name__ == '__main__':
    create_admin()