from datetime import date, timedelta
from django.utils import timezone
from .models import Calendrier
from meteo.services import MeteoService

class AjustementCalendrier:
    """
    Service d'ajustement dynamique du calendrier
    """

    @staticmethod
    def ajuster_pour_meteo(parcelle):
        """
        Ajuste le calendrier en fonction des prévisions météo
        """
        if not parcelle.latitude or not parcelle.longitude:
            return []

        meteo = MeteoService.get_meteo_jour(parcelle.latitude, parcelle.longitude)
        if isinstance(meteo, dict) and 'error' in meteo:
            return []

        ajustements = []
        pluie = meteo.get('pluie', 0)
        temp_max = meteo.get('temp_max', 0)

        # Récupérer les prochaines étapes (7 jours)
        prochaines_etapes = Calendrier.objects.filter(
            parcelle=parcelle,
            statut__in=['a_venir', 'en_retard'],
            date_prevue__lte=date.today() + timedelta(days=7)
        ).order_by('date_prevue')

        for etape_cal in prochaines_etapes:
            raison = ""
            nouvelle_date = etape_cal.date_prevue

            # Pluie > 20mm pendant les semis
            if etape_cal.etape.nom == "Semis" and pluie > 20:
                nouvelle_date = etape_cal.date_prevue + timedelta(days=2)
                raison = f"Forte pluie annoncée ({pluie}mm), semis reporté de 2 jours"
            
            # Pluie > 30mm avant sarclage
            elif etape_cal.etape.nom == "Premier sarclage" and pluie > 30:
                nouvelle_date = etape_cal.date_prevue + timedelta(days=1)
                raison = f"Sol trop humide, sarclage reporté de 1 jour"
            
            # Température > 35°C pour la fertilisation
            elif etape_cal.etape.nom == "Apport d'engrais" and temp_max > 35:
                nouvelle_date = etape_cal.date_prevue + timedelta(days=3)
                raison = f"Température élevée ({temp_max}°C), fertilisation reportée"

            # Pluie > 30mm pour la récolte
            elif etape_cal.etape.nom == "Récolte" and pluie > 30:
                nouvelle_date = etape_cal.date_prevue - timedelta(days=1)
                raison = f"Risque de pourriture, récolte avancée de 1 jour"

            if raison:
                etape_cal.ajuster(nouvelle_date, raison)
                ajustements.append({
                    'etape': etape_cal.etape.nom,
                    'ancienne_date': etape_cal.date_originale,
                    'nouvelle_date': nouvelle_date,
                    'raison': raison
                })

        return ajustements

    @staticmethod
    def ajuster_pour_retard(parcelle):
        """
        Ajuste les étapes suivantes si une étape est en retard
        """
        # Trouver les étapes en retard
        en_retard = Calendrier.objects.filter(
            parcelle=parcelle,
            statut='en_retard'
        ).order_by('date_prevue')

        ajustements = []
        for etape_retard in en_retard:
            # Décaler toutes les étapes suivantes
            jours_retard = (date.today() - etape_retard.date_prevue).days
            if jours_retard > 0:
                etapes_suivantes = Calendrier.objects.filter(
                    parcelle=parcelle,
                    date_prevue__gt=etape_retard.date_prevue
                ).order_by('date_prevue')

                for suivante in etapes_suivantes:
                    nouvelle_date = suivante.date_prevue + timedelta(days=jours_retard)
                    suivante.ajuster(
                        nouvelle_date,
                        f"Report automatique suite au retard de l'étape '{etape_retard.etape.nom}'"
                    )
                    ajustements.append({
                        'etape': suivante.etape.nom,
                        'ancienne_date': suivante.date_originale,
                        'nouvelle_date': nouvelle_date,
                        'raison': f"Report suite au retard de {etape_retard.etape.nom}"
                    })

        return ajustements

    @staticmethod
    def ajuster_tout(parcelle):
        """
        Effectue tous les ajustements pour une parcelle
        """
        resultats = {
            'ajustements_meteo': AjustementCalendrier.ajuster_pour_meteo(parcelle),
            'ajustements_retard': AjustementCalendrier.ajuster_pour_retard(parcelle),
        }
        return resultats

    @staticmethod
    def generer_plan_initial(parcelle):
        """
        Génère le plan initial et sauvegarde la date originale
        """
        from .services import CalendrierService
        etapes = CalendrierService.creer_calendrier(parcelle)
        
        for cal in etapes:
            cal.date_originale = cal.date_prevue
            cal.save()
        
        return etapes