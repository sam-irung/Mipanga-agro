# backend/saisons/services/openmeteo_seasonal.py

import requests
from datetime import datetime, timedelta
from django.core.cache import cache

class OpenMeteoSeasonalService:
    """
    Service d'intégration avec Open-Meteo Seasonal Forecast API
    """
    BASE_URL = "https://seasonal-api.open-meteo.com/v1/seasonal"
    CACHE_TIMEOUT = 86400  # 24 heures

    @staticmethod
    def _get_cache_key(latitude, longitude):
        return f"seasonal_{latitude}_{longitude}"

    @staticmethod
    def get_seasonal_forecast(latitude, longitude):
        """
        Récupère les prévisions saisonnières (ECMWF SEAS5)
        """
        cache_key = OpenMeteoSeasonalService._get_cache_key(latitude, longitude)
        cached_data = cache.get(cache_key)

        if cached_data:
            return cached_data

        # ✅ Paramètres complets pour les prévisions saisonnières
        params = {
            'latitude': float(latitude),
            'longitude': float(longitude),
            'timezone': 'Africa/Kinshasa',
            # ✅ Variables saisonnières
            'daily': 'temperature_2m_mean,precipitation_sum,wind_speed_10m_mean,relative_humidity_2m_mean',
            'past_days': 0,
            'forecast_days': 42,  # EC46: 46 jours
            'model': 'ecmwf_seas5'  # ✅ Modèle saisonnier SEAS5
        }

        try:
            response = requests.get(
                OpenMeteoSeasonalService.BASE_URL,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            # ✅ Analyser avec les anomalies réelles
            result = OpenMeteoSeasonalService._analyser_avec_anomalies(data)

            # Mettre en cache
            cache.set(cache_key, result, OpenMeteoSeasonalService.CACHE_TIMEOUT)
            return result

        except requests.RequestException as e:
            print(f"⚠️ Erreur Open-Meteo Seasonal: {e}")
            return OpenMeteoSeasonalService._status_indisponible()

    @staticmethod
    def _analyser_avec_anomalies(data):
        """
        Analyse les données avec calcul des anomalies
        """
        if 'daily' not in data:
            return OpenMeteoSeasonalService._status_indisponible()

        daily = data['daily']

        # Vérifier que les données existent
        if 'temperature_2m_mean' not in daily or 'precipitation_sum' not in daily:
            return OpenMeteoSeasonalService._status_indisponible()

        # ✅ 1. Analyser la température
        temp_data = daily['temperature_2m_mean']
        temp_moyenne = sum(temp_data) / len(temp_data) if temp_data else 25

        # ✅ 2. Analyser la pluie
        pluie_data = daily['precipitation_sum']
        pluie_totale = sum(pluie_data) if pluie_data else 0
        pluie_jours = len([p for p in pluie_data if p > 1]) if pluie_data else 0

        # ✅ 3. Analyser le vent
        vent_data = daily.get('wind_speed_10m_mean', [])
        vent_moyen = sum(vent_data) / len(vent_data) if vent_data else 10

        # ✅ 4. Analyser l'humidité
        humidite_data = daily.get('relative_humidity_2m_mean', [])
        humidite_moyenne = sum(humidite_data) / len(humidite_data) if humidite_data else 60

        # ✅ 5. Calculer les anomalies (par rapport à une climatologie de référence)
        # Température: référence 25°C pour Lubumbashi en saison A
        temp_reference = 25
        temp_anomalie = round(temp_moyenne - temp_reference, 1)
        temp_pourcentage = round((temp_moyenne / temp_reference) * 100, 1)

        # Pluie: référence 450mm pour une saison A à Lubumbashi
        pluie_reference = 450
        pluie_anomalie = round(((pluie_totale - pluie_reference) / pluie_reference) * 100, 1)

        # ✅ 6. Déterminer les tendances basées sur les anomalies
        # Température
        if temp_anomalie > 2:
            temp_tendance = 'au_dessus'
        elif temp_anomalie < -2:
            temp_tendance = 'en_dessous'
        else:
            temp_tendance = 'normal'

        # Pluie
        if pluie_anomalie > 20:
            pluie_tendance = 'au_dessus'
        elif pluie_anomalie < -20:
            pluie_tendance = 'en_dessous'
        else:
            pluie_tendance = 'normal'

        # Vent
        vent_reference = 12
        vent_anomalie = round(((vent_moyen - vent_reference) / vent_reference) * 100, 1)
        if vent_anomalie > 20:
            vent_tendance = 'au_dessus'
        elif vent_anomalie < -20:
            vent_tendance = 'en_dessous'
        else:
            vent_tendance = 'normal'

        # ✅ 7. Niveau de confiance (basé sur la cohérence des données)
        confiance = 'eleve'
        if pluie_tendance == 'normal' and temp_tendance == 'normal':
            confiance = 'moyen'
        if pluie_anomalie > 50 or temp_anomalie > 5:
            confiance = 'faible'

        return {
            'status': 'available',
            'source': 'Open-Meteo / ECMWF SEAS5',
            'resolution': '36 km',
            'date_mise_a_jour': datetime.now().isoformat(),
            'confiance': confiance,

            # Données brutes
            'temp_moyenne': round(temp_moyenne, 1),
            'temp_anomalie': temp_anomalie,
            'temp_pourcentage': temp_pourcentage,
            'temp_tendance': temp_tendance,

            'pluie_totale': round(pluie_totale, 1),
            'pluie_anomalie': pluie_anomalie,
            'pluie_tendance': pluie_tendance,
            'pluie_jours': pluie_jours,

            'vent_moyen': round(vent_moyen, 1),
            'vent_anomalie': vent_anomalie,
            'vent_tendance': vent_tendance,

            'humidite_moyenne': round(humidite_moyenne, 1),

            # Métadonnées
            'nb_jours': len(temp_data),
            'periode_debut': daily['time'][0] if daily['time'] else None,
            'periode_fin': daily['time'][-1] if daily['time'] else None,
        }

    @staticmethod
    def _status_indisponible():
        """
        Retourne un statut d'indisponibilité
        """
        return {
            'status': 'unavailable',
            'source': None,
            'message': "Les données saisonnières ne sont momentanément pas disponibles.",
            'date_mise_a_jour': datetime.now().isoformat()
        }