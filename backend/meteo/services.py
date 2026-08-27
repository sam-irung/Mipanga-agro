# backend/meteo/services.py

import requests
from datetime import datetime, timedelta
from django.core.cache import cache

class WeatherService:
    """
    Service d'intégration avec Open-Meteo
    """
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    CACHE_TIMEOUT = 3600  # 1 heure

    @staticmethod
    def _get_cache_key(latitude, longitude, jours):
        return f"weather_{latitude}_{longitude}_{jours}"

    @staticmethod
    def _fetch_from_openmeteo(latitude, longitude, jours=7):
        """
        Récupère les données brutes depuis Open-Meteo
        """
        params = {
            'latitude': float(latitude),
            'longitude': float(longitude),
            'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum',
            'timezone': 'Africa/Kinshasa',
            'forecast_days': jours
        }

        try:
            response = requests.get(
                WeatherService.BASE_URL,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"⚠️ Erreur Open-Meteo: {e}")
            return None

    @staticmethod
    def _normalize_weather_data(raw_data):
        """
        Normalise les données Open-Meteo en format interne
        """
        if not raw_data or 'daily' not in raw_data:
            return None

        daily = raw_data['daily']
        previsions = []

        for i in range(len(daily['time'])):
            previsions.append({
                'date': daily['time'][i],
                'temp_min': round(daily['temperature_2m_min'][i], 1),
                'temp_max': round(daily['temperature_2m_max'][i], 1),
                'pluie': round(daily['precipitation_sum'][i], 1),
                'humidite': 65,  # Valeur par défaut car non fournie par l'API
                'vent': 10,      # Valeur par défaut car non fournie par l'API
            })

        return previsions

    @staticmethod
    def _get_fallback_meteo(latitude, longitude, jours=7):
        """
        Données de secours en cas d'échec de l'API
        """
        aujourd_hui = datetime.now()
        previsions = []
        
        for i in range(jours):
            date = aujourd_hui + timedelta(days=i)
            previsions.append({
                'date': date.strftime('%Y-%m-%d'),
                'temp_min': round(20 + (i % 5), 1),
                'temp_max': round(28 + (i % 7), 1),
                'pluie': round(max(0, 5 - i + (i % 3)), 1),
                'humidite': round(60 + (i % 20), 1),
                'vent': round(10 + (i % 15), 1),
            })
        
        return previsions

    @staticmethod
    def get_meteo(latitude, longitude, jours=7):
        """
        Récupère les prévisions météo formatées
        """
        cache_key = WeatherService._get_cache_key(latitude, longitude, jours)
        cached_data = cache.get(cache_key)

        if cached_data:
            return cached_data

        raw_data = WeatherService._fetch_from_openmeteo(latitude, longitude, jours)
        
        if raw_data is None:
            print("⚠️ Utilisation des données météo de secours")
            normalized_data = WeatherService._get_fallback_meteo(latitude, longitude, jours)
        else:
            normalized_data = WeatherService._normalize_weather_data(raw_data)

        if normalized_data is None:
            normalized_data = WeatherService._get_fallback_meteo(latitude, longitude, jours)

        cache.set(cache_key, normalized_data, WeatherService.CACHE_TIMEOUT)
        return normalized_data

    @staticmethod
    def get_meteo_jour(latitude, longitude):
        """
        Récupère la météo du jour
        """
        previsions = WeatherService.get_meteo(latitude, longitude, jours=1)

        if isinstance(previsions, dict) and 'error' in previsions:
            return previsions

        return previsions[0] if previsions else {'error': 'Aucune donnée disponible'}

    @staticmethod
    def get_resume_meteo(parcelle, jours=7):
        """
        Retourne un résumé complet de la météo pour une parcelle
        """
        if not parcelle.latitude or not parcelle.longitude:
            return {'error': 'Coordonnées GPS manquantes'}

        previsions = WeatherService.get_meteo(
            parcelle.latitude,
            parcelle.longitude,
            jours
        )

        if isinstance(previsions, dict) and 'error' in previsions:
            return previsions

        aujourd_hui = previsions[0] if previsions else None

        return {
            'aujourd_hui': aujourd_hui,
            'previsions': previsions,
            'source': 'Open-Meteo',
            'mise_a_jour': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }