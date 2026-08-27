FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
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

RUN python manage.py migrate

# ✅ COMMANDE SUR UNE SEULE LIGNE
RUN python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(telephone='+243971268236', defaults={'username': 'admin', 'first_name': 'Admin', 'last_name': 'Mipanga', 'email': 'admin@mipanga.com', 'is_superuser': True, 'is_staff': True, 'province': 'Haut-katanga', 'territoire': 'Lubumbashi'}); user.set_password('Mipanga2025!'); user.save(); print('✅ Admin créé/mis à jour avec succès')"

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "mipanga_agro.wsgi:application", "--bind", "0.0.0.0:8000"]