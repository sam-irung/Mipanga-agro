import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url  # ← IMPORTANT: Ajout pour PostgreSQL

# Charger les variables d'environnement
load_dotenv()

# ============================================================================
# CONFIGURATION DE BASE
# ============================================================================

# Chemin de base du projet
BASE_DIR = Path(__file__).resolve().parent.parent

# Clé secrète (utilise une variable d'environnement en production)
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-dev-key')

# Mode debug (False par défaut en production)
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# Hôtes autorisés
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
    if host.strip()
]

# ============================================================================
# APPLICATIONS INSTALLÉES
# ============================================================================

INSTALLED_APPS = [
    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    
    # Applications Mipanga Agro
    'accounts',
    'cultures',
    'saisons',
    'parcelles',
    'planification',
    'meteo',
    'recommandations',
    'suivi',
    'dashboard',
    'ia',
    'notifications',
]

# ============================================================================
# MIDDLEWARE
# ============================================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Doit être en premier
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ============================================================================
# URLS ET TEMPLATES
# ============================================================================

ROOT_URLCONF = 'mipanga_agro.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mipanga_agro.wsgi.application'

# ============================================================================
# BASE DE DONNÉES
# ============================================================================

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    )
}

# ============================================================================
# VALIDATION DES MOTS DE PASSE
# ============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'
    },
]

# ============================================================================
# INTERNATIONALISATION
# ============================================================================

LANGUAGE_CODE = 'fr'
TIME_ZONE = 'Africa/Kinshasa'
USE_I18N = True
USE_TZ = True

# ============================================================================
# FICHIERS STATIQUES ET MÉDIAS
# ============================================================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================================================
# CORS (Cross-Origin Resource Sharing)
# ============================================================================

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://localhost:3000'
    ).split(',')
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

# En développement uniquement, décommentez la ligne ci-dessous
# CORS_ALLOW_ALL_ORIGINS = True

# ============================================================================
# JWT (JSON Web Tokens)
# ============================================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# ============================================================================
# DJANGO REST FRAMEWORK
# ============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ============================================================================
# SWAGGER / OPENAPI (drf-spectacular)
# ============================================================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'Mipanga Agro API',
    'DESCRIPTION': 'API pour l\'assistant agricole intelligent en RDC',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# ============================================================================
# MODÈLE UTILISATEUR PERSONNALISÉ
# ============================================================================

AUTH_USER_MODEL = 'accounts.Utilisateur'

# ============================================================================
# CACHE
# ============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'mipanga-agro-cache',
    }
}

# ============================================================================
# LOGGING (Optionnel - pour le débogage)
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}

# ============================================================================
# VARIABLES D'ENVIRONNEMENT PERSONNALISÉES
# ============================================================================

# OpenRouter pour l'IA
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
OPENROUTER_API_URL = os.getenv(
    'OPENROUTER_API_URL',
    'https://openrouter.ai/api/v1/chat/completions'
)

# Open-Meteo (gratuit, sans clé)
OPENMETEO_API_URL = os.getenv(
    'OPENMETEO_API_URL',
    'https://api.open-meteo.com/v1/forecast'
)

# Site URL pour les liens dans les emails (si utilisé)
SITE_URL = os.getenv('SITE_URL', 'https://mipanga-agro.vercel.app')