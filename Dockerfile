FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ✅ Définir SECRET_KEY pour le build
ENV SECRET_KEY=django-insecure-build-temp-key-do-not-use-in-production
ENV OPENROUTER_API_KEY=dummy-key-for-build

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# ✅ 1. Migrations
RUN python manage.py migrate

# ✅ 2. Créer le superutilisateur
RUN python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.get_or_create(username='admin', defaults={'email':'admin@mipanga.com', 'is_superuser':True, 'is_staff':True}); user=User.objects.get(username='admin'); user.set_password('Mipanga2025!'); user.save(); print('✅ Superuser created')"

# ✅ 3. Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "mipanga_agro.wsgi:application", "--bind", "0.0.0.0:8000"]