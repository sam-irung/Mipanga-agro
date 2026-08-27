# backend/create_superuser.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mipanga_agro.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@mipanga.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'Mipanga2026!')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"✅ Superutilisateur '{username}' créé avec succès!")
else:
    print(f"ℹ️ Superutilisateur '{username}' existe déjà.")