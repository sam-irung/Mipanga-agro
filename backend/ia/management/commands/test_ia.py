# backend/ia/management/commands/test_ia.py

from django.core.management.base import BaseCommand
from parcelles.models import Parcelle
from ia.services.recommendation_service import RecommendationService
from ia.services.vision_service import VisionService
from planification.services import CalendrierService
from meteo.services import WeatherService

class Command(BaseCommand):
    help = 'Teste le module IA'

    def handle(self, *args, **kwargs):
        self.stdout.write("🧪 Test du module IA...")
        
        # Tester l'analyse de parcelle
        parcelle = Parcelle.objects.first()
        if parcelle:
            self.stdout.write(f"📋 Parcelle: {parcelle.nom}")
            
            # Météo
            meteo = {}
            if parcelle.latitude and parcelle.longitude:
                meteo = WeatherService.get_meteo_jour(
                    parcelle.latitude,
                    parcelle.longitude
                )
            
            # Calendrier
            stats = CalendrierService.obtenir_statistiques(parcelle)
            prochaine = CalendrierService.obtenir_prochaine_etape(parcelle)
            calendrier = {'stats': stats, 'prochaine': prochaine}
            
            # Analyse
            resultat = RecommendationService.analyser(parcelle, meteo, calendrier)
            self.stdout.write(f"📊 Résultat: {resultat}")
        else:
            self.stdout.write("❌ Aucune parcelle trouvée")