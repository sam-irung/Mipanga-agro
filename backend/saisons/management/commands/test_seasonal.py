# backend/saisons/management/commands/test_seasonal.py

from django.core.management.base import BaseCommand
from saisons.services.openmeteo_seasonal import OpenMeteoSeasonalService
import json

class Command(BaseCommand):
    help = 'Teste l\'API Open-Meteo Seasonal'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌤 Test de l'API Open-Meteo Seasonal...")

        # Coordonnées de Lubumbashi
        lat = -11.6645
        lng = 27.4824

        data = OpenMeteoSeasonalService.get_seasonal_forecast(lat, lng)

        if data.get('status') == 'available':
            self.stdout.write(self.style.SUCCESS("✅ Données saisonnières récupérées"))
            self.stdout.write("")
            self.stdout.write("📊 RÉSULTATS:")
            self.stdout.write(f"   Température: {data.get('temp_moyenne')}°C")
            self.stdout.write(f"   Anomalie température: {data.get('temp_anomalie')}°C ({data.get('temp_tendance')})")
            self.stdout.write(f"   Pluie totale: {data.get('pluie_totale')} mm")
            self.stdout.write(f"   Anomalie pluie: {data.get('pluie_anomalie')}% ({data.get('pluie_tendance')})")
            self.stdout.write(f"   Vent moyen: {data.get('vent_moyen')} km/h")
            self.stdout.write(f"   Humidité: {data.get('humidite_moyenne')}%")
            self.stdout.write(f"   Confiance: {data.get('confiance')}")
            self.stdout.write(f"   Source: {data.get('source')}")
            self.stdout.write(f"   Période: {data.get('periode_debut')} → {data.get('periode_fin')}")
        else:
            self.stdout.write(self.style.WARNING("⚠️ Données indisponibles"))
            self.stdout.write(f"📊 Message: {data.get('message')}")