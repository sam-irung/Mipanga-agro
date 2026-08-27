# backend/saisons/services/season_service.py

from datetime import date
from cultures.models import ZoneAgricole
from saisons.models import ProfilSaison, ScoreCultureSaison
from .scoring_service import ScoringService
from .openmeteo_seasonal import OpenMeteoSeasonalService

class SeasonService:
    """
    Service principal de gestion des saisons
    """

    @staticmethod
    def get_saison_actuelle(zone_id):
        """
        Récupère ou crée la saison actuelle avec données météo réelles
        """
        zone = ZoneAgricole.objects.get(id=zone_id)

        # Récupérer les données saisonnières
        meteo_data = {}
        if zone.latitude and zone.longitude:
            meteo_data = OpenMeteoSeasonalService.get_seasonal_forecast(
                float(zone.latitude),
                float(zone.longitude)
            )

        # Vérifier si une saison existe déjà
        saison = ProfilSaison.objects.filter(
            zone=zone,
            actif=True
        ).order_by('-date_creation').first()

        if not saison:
            # Déterminer les tendances
            pluie_tendance = 'normal'
            temp_tendance = 'normal'
            vent_tendance = 'normal'
            confiance = 'moyen'
            source = 'Open-Meteo'

            if meteo_data.get('status') == 'available':
                pluie_tendance = meteo_data.get('pluie_tendance', 'normal')
                temp_tendance = meteo_data.get('temp_tendance', 'normal')
                vent_tendance = meteo_data.get('vent_tendance', 'normal')
                confiance = meteo_data.get('confiance', 'moyen')
                source = meteo_data.get('source', 'Open-Meteo')

            # Créer la saison
            saison = ProfilSaison.objects.create(
                zone=zone,
                nom=f"Saison {date.today().year}-{date.today().year + 1}",
                saison='A',
                pluie_tendance=pluie_tendance,
                temperature_tendance=temp_tendance,
                vent_tendance=vent_tendance,
                pluie_probabilite=meteo_data.get('pluie_anomalie') if meteo_data.get('status') == 'available' else None,
                niveau_confiance=confiance,
                source=source,
                actif=True
            )

            # ✅ AJOUTER : Générer les scores
            ScoringService.sauvegarder_scores(saison)

        return saison

    @staticmethod
    def get_cultures_recommandees(zone_id):
        """
        Récupère les cultures recommandées pour une zone
        """
        saison = SeasonService.get_saison_actuelle(zone_id)
        scores = ScoreCultureSaison.objects.filter(
            profil_saison=saison
        ).order_by('-score_global')

        return {
            'saison': saison,
            'favorables': scores.filter(niveau='favorable'),
            'attention': scores.filter(niveau='attention'),
            'defavorables': scores.filter(niveau='defavorable')
        }

    @staticmethod
    def mettre_a_jour_saison(zone_id, donnees):
        """
        Met à jour les données d'une saison
        """
        saison = SeasonService.get_saison_actuelle(zone_id)

        for key, value in donnees.items():
            if hasattr(saison, key):
                setattr(saison, key, value)

        saison.save()
        ScoringService.sauvegarder_scores(saison)

        return saison