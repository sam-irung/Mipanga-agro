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
RUN python create_admin.py
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "mipanga_agro.wsgi:application", "--bind", "0.0.0.0:8000"]