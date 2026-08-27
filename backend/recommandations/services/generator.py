# backend/recommandations/services/generator.py

from datetime import date
from .rule_engine import RuleEngine
from planification.services import CalendrierService
from meteo.services import WeatherService
from recommandations.models import RegleAgronomique, Recommandation

class RecommendationGenerator:
    """
    Générateur de recommandations
    """

    @staticmethod
    def generer_recommandations(parcelle):
        """
        Génère toutes les recommandations pour une parcelle
        """
        # 1. Récupérer la météo
        meteo = {}
        if parcelle.latitude and parcelle.longitude:
            meteo_jour = WeatherService.get_meteo_jour(
                parcelle.latitude,
                parcelle.longitude
            )
            if not isinstance(meteo_jour, dict) or 'error' not in meteo_jour:
                meteo = meteo_jour

        # 2. Âge de la culture
        age = (date.today() - parcelle.date_semis).days

        # 3. Récupérer les étapes du calendrier
        etapes = CalendrierService.obtenir_toutes_etapes(parcelle)
        recommandations = []

        for cal in etapes:
            # Calculer le retard
            jours_retard = 0
            if cal.statut == 'en_retard':
                jours_retard = (date.today() - cal.date_prevue).days

            # Récupérer les règles pour cette culture et étape
            regles = RegleAgronomique.objects.filter(
                culture=parcelle.culture,
                etape=cal.etape,
                active=True
            ).order_by('priorite')

            if not regles.exists():
                regles = RegleAgronomique.objects.filter(
                    culture=parcelle.culture,
                    etape__isnull=True,
                    active=True
                ).order_by('priorite')

            for regle in regles:
                if RuleEngine.evaluer_condition(
                    regle.conditions,
                    meteo,
                    age,
                    cal.etape.nom if cal.etape else None,
                    jours_retard
                ):
                    niveau = regle.niveau
                    
                    if jours_retard > 7 and niveau != 'critique':
                        niveau = 'critique'
                    elif jours_retard > 3 and niveau == 'conseil':
                        niveau = 'important'

                    message = regle.conseil
                    if jours_retard > 0:
                        message = f"🔴 {message} (Retard de {jours_retard} jours)"

                    recommandations.append({
                        'regle': regle,
                        'titre': f"{cal.etape.nom if cal.etape else 'Général'} - {regle.get_source_display()}",
                        'message': message,
                        'solution': regle.solution,
                        'niveau': niveau,
                        'source': regle.source,
                        'contexte': {
                            'etape': cal.etape.nom if cal.etape else None,
                            'date_prevue': cal.date_prevue.isoformat() if cal.date_prevue else None,  # ✅ Convertir en chaîne
                            'jours_retard': jours_retard,
                            'statut': cal.statut,
                            'age': age,
                            'meteo': meteo
                        }
                    })

        # 4. Règles génériques
        regles_generiques = RegleAgronomique.objects.filter(
            culture=parcelle.culture,
            etape__isnull=True,
            active=True
        ).order_by('priorite')

        for regle in regles_generiques:
            if RuleEngine.evaluer_condition(
                regle.conditions,
                meteo,
                age,
                None,
                0
            ):
                recommandations.append({
                    'regle': regle,
                    'titre': "Alerte générale",
                    'message': regle.conseil,
                    'solution': regle.solution,
                    'niveau': regle.niveau,
                    'source': regle.source,
                    'contexte': {
                        'age': age,
                        'meteo': meteo
                    }
                })

        # 5. Conseils par défaut
        if not recommandations:
            prochaine = CalendrierService.obtenir_prochaine_etape(parcelle)
            if prochaine:
                jours_restants = (prochaine.date_prevue - date.today()).days
                if jours_restants < 0:
                    jours_restants = 0
                recommandations.append({
                    'regle': None,
                    'titre': "Prochaine étape",
                    'message': f"Prochaine étape : {prochaine.etape.nom} dans {jours_restants} jours.",
                    'solution': "Suivez le calendrier prévu.",
                    'niveau': 'conseil',
                    'source': 'calendrier',
                    'contexte': {
                        'etape': prochaine.etape.nom,
                        'date_prevue': prochaine.date_prevue.isoformat() if prochaine.date_prevue else None,  # ✅ Convertir en chaîne
                        'jours_restants': jours_restants
                    }
                })

        return recommandations

    @staticmethod
    def sauvegarder(parcelle):
        """
        Sauvegarde les recommandations générées
        """
        Recommandation.objects.filter(
            parcelle=parcelle,
            lue=False,
            active=True
        ).update(active=False)

        recommandations = RecommendationGenerator.generer_recommandations(parcelle)

        created = []
        for rec_data in recommandations:
            rec = Recommandation.objects.create(
                parcelle=parcelle,
                regle=rec_data['regle'],
                titre=rec_data.get('titre', ''),
                message=rec_data['message'],
                solution=rec_data.get('solution', ''),
                niveau=rec_data['niveau'],
                source=rec_data['source'],
                contexte=rec_data.get('contexte', {}),
                active=True
            )
            created.append(rec)

        return created