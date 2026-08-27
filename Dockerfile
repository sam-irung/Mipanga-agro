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

# ✅ CRÉER L'ADMIN AVEC TOUS LES CHAMPS
RUN python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(telephone='+243971268236').delete(); User.objects.create_superuser(telephone='+243971268236', username='admin', first_name='Admin', last_name='Mipanga', email='admin@mipanga.com', password='Mipanga2025!', province='Lubumbashi', territoire='Lubumbashi'); print('✅ Admin créé avec téléphone +243971268236')"

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "mipanga_agro.wsgi:application", "--bind", "0.0.0.0:8000"]