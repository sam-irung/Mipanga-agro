from datetime import date
from django.db.models import Count, Sum, Avg, Q, Case, When, Value, IntegerField
from parcelles.models import Parcelle
from planification.models import Calendrier
from meteo.services import WeatherService
from recommandations.models import Recommandation
from suivi.models import ActionRealisee
from django.db.models import Subquery, OuterRef
from ia.models import AnalyseImage

class DashboardService:
    """
    Service de collecte et d'agrégation des données pour le dashboard
    """

    @staticmethod
    def get_dashboard_data(agriculteur):
        """
        Récupère toutes les données pour le dashboard d'un agriculteur
        """
        print("🔍 get_dashboard_data appelé")
        return {
            'resume': DashboardService._get_resume(agriculteur),
            'parcelles': DashboardService._get_parcelles_info(agriculteur),
            'calendrier': DashboardService._get_calendrier_info(agriculteur),
            'recommandations': DashboardService._get_recommandations_info(agriculteur),
            'activites': DashboardService._get_activites_info(agriculteur),
            'statistiques': DashboardService._get_statistiques(agriculteur),
            'alerte_meteo': DashboardService._get_alertes_meteo(agriculteur),
            'ia': DashboardService._get_ia_info(agriculteur),
        }

    @staticmethod
    def _get_resume(agriculteur):
        """
        Résumé rapide des indicateurs clés
        """
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)
        total_parcelles = parcelles.count()
        parcelles_actives = parcelles.filter(statut__in=['planifiee', 'en_cours']).count()
        parcelles_recoltees = parcelles.filter(statut='recoltee').count()

        print(f"🔍 DEBUG - total: {total_parcelles}, actives: {parcelles_actives}, recoltees: {parcelles_recoltees}")

        # Progression moyenne - CORRIGÉ : utiliser statut='realise'
        calendriers = Calendrier.objects.filter(
            parcelle__agriculteur=agriculteur
        ).values('parcelle_id').annotate(
            total=Count('id'),
            realisees=Count(Case(When(statut='realise', then=1)))
        )

        total_progression = 0
        for c in calendriers:
            if c['total'] > 0:
                total_progression += int((c['realisees'] / c['total']) * 100)

        progression_moyenne = int(total_progression / total_parcelles) if total_parcelles > 0 else 0

        recommandations_non_lues = Recommandation.objects.filter(
            parcelle__agriculteur=agriculteur,
            lue=False,
            active=True
        ).count()

        return {
            'total_parcelles': total_parcelles,
            'parcelles_actives': parcelles_actives,
            'parcelles_recoltees': parcelles_recoltees,
            'progression_moyenne': progression_moyenne,
            'recommandations_non_lues': recommandations_non_lues,
        }

    @staticmethod
    def _get_parcelles_info(agriculteur):
        """
        Informations détaillées sur les parcelles (optimisé)
        """
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur).select_related('culture')

        resultats = []
        for parcelle in parcelles:
            total = Calendrier.objects.filter(parcelle=parcelle).count()
            # CORRIGÉ : utiliser statut='realise'
            realisees = Calendrier.objects.filter(parcelle=parcelle, statut='realise').count()
            prochaine = Calendrier.objects.filter(
                parcelle=parcelle,
                statut__in=['a_venir', 'en_retard']
            ).order_by('date_prevue').first()

            resultats.append({
                'id': parcelle.id,
                'nom': parcelle.nom,
                'culture': parcelle.culture.nom,
                'statut': parcelle.get_statut_display(),
                'statut_code': parcelle.statut,
                'superficie': float(parcelle.superficie),
                'progression': int((realisees / total) * 100) if total > 0 else 0,
                'prochaine_etape': prochaine.etape.nom if prochaine else None,
                'age': parcelle.age(),
            })

        return resultats


    @staticmethod
    def _get_calendrier_info(agriculteur):
        """
        Informations sur le calendrier (prochaines étapes, retards)
        """
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)

        # CORRIGÉ : utiliser statut='realise'
        prochaines = Calendrier.objects.filter(
            parcelle__in=parcelles,
            statut__in=['a_venir', 'en_retard']
        ).select_related('parcelle', 'etape').order_by('date_prevue')[:3]

        en_retard = Calendrier.objects.filter(
            parcelle__in=parcelles,
            statut='en_retard'
        ).count()

        return {
            'prochaines_etapes': [
                {
                    'parcelle': e.parcelle.nom,
                    'etape': e.etape.nom,
                    'date_prevue': e.date_prevue,
                    'jours_restants': max(0, (e.date_prevue - date.today()).days)
                }
                for e in prochaines
            ],
            'etapes_en_retard': en_retard,
        }
    
    @staticmethod
    def _get_recommandations_info(agriculteur):
        """
        Dernières recommandations
        """
        recommandations = Recommandation.objects.filter(
            parcelle__agriculteur=agriculteur,
            active=True
        ).select_related('parcelle').order_by('-date')[:5]

        return [
            {
                'id': r.id,
                'parcelle': r.parcelle.nom,
                'message': r.message,
                'niveau': r.niveau,
                'source': r.source,
                'date': r.date,
                'lue': r.lue,
            }
            for r in recommandations
        ]

    @staticmethod
    def _get_activites_info(agriculteur):
        """
        Dernières activités (actions réalisées)
        """
        actions = ActionRealisee.objects.filter(
            parcelle__agriculteur=agriculteur
        ).select_related('parcelle', 'etape').order_by('-date_realisation')[:5]

        return [
            {
                'parcelle': a.parcelle.nom,
                'etape': a.etape.nom,
                'date': a.date_realisation,
                'commentaire': a.commentaire,
            }
            for a in actions
        ]

    @staticmethod
    def _get_statistiques(agriculteur):
        """
        Statistiques globales (avec données pour graphiques)
        """
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)

        # Répartition par culture
        repartition_cultures = parcelles.values(
            'culture__nom'
        ).annotate(
            count=Count('id')
        ).order_by('-count')

        # Répartition par statut
        repartition_statuts = parcelles.values(
            'statut'
        ).annotate(
            count=Count('id')
        )

        # Données pour graphiques
        cultures_labels = [c['culture__nom'] for c in repartition_cultures]
        cultures_values = [c['count'] for c in repartition_cultures]

        return {
            'repartition_cultures': list(repartition_cultures),
            'repartition_statuts': list(repartition_statuts),
            'total_superficie': sum(float(p.superficie) for p in parcelles),
            'graphiques': {
                'cultures': {
                    'labels': cultures_labels,
                    'values': cultures_values,
                },
                'statuts': {
                    'labels': [s['statut'] for s in repartition_statuts],
                    'values': [s['count'] for s in repartition_statuts],
                }
            }
        }

    @staticmethod
    def _get_alertes_meteo(agriculteur):
        """
        Alertes météo pour les parcelles actives (24h)
        """
        parcelles = Parcelle.objects.filter(
            agriculteur=agriculteur,
            statut__in=['planifiee', 'en_cours']
        )
        alertes = []

        for parcelle in parcelles:
            if not parcelle.latitude or not parcelle.longitude:
                continue

            meteo = WeatherService.get_meteo_jour(
                parcelle.latitude,
                parcelle.longitude
            )

            if isinstance(meteo, dict) and 'error' in meteo:
                continue

            # Alertes pluie
            if meteo.get('pluie', 0) > 30:
                alertes.append({
                    'parcelle': parcelle.nom,
                    'type': 'alerte',
                    'categorie': 'pluie',
                    'message': f"Forte pluie annoncée ({meteo['pluie']}mm)",
                    'niveau': 'rouge'
                })
            elif meteo.get('pluie', 0) > 15:
                alertes.append({
                    'parcelle': parcelle.nom,
                    'type': 'attention',
                    'categorie': 'pluie',
                    'message': f"Pluie modérée annoncée ({meteo['pluie']}mm)",
                    'niveau': 'orange'
                })

            # Alertes température
            if meteo.get('temp_max', 0) > 35:
                alertes.append({
                    'parcelle': parcelle.nom,
                    'type': 'attention',
                    'categorie': 'temperature',
                    'message': f"Température très élevée ({meteo['temp_max']}°C)",
                    'niveau': 'orange'
                })
            elif meteo.get('temp_min', 0) < 10:
                alertes.append({
                    'parcelle': parcelle.nom,
                    'type': 'attention',
                    'categorie': 'temperature',
                    'message': f"Température basse ({meteo['temp_min']}°C)",
                    'niveau': 'orange'
                })

        return alertes[:5]

    @staticmethod
    def _get_ia_info(agriculteur):
        """
        Récupère les informations IA pour le dashboard
        """
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)
        analyses = AnalyseImage.objects.filter(parcelle__in=parcelles)
        
        # Nombre total d'analyses
        total_analyses = analyses.count()
        
        # Score santé moyen
        score_moyen = analyses.aggregate(Avg('score_sante'))['score_sante__avg'] or 0
        
        # Dernière analyse
        derniere = analyses.order_by('-date_analyse').first()
        
        # Évolution des scores (dernières 5 analyses)
        evolution = list(analyses.order_by('date_analyse').values_list('score_sante', flat=True)[:5])
        
        # Répartition des états
        etats = analyses.values('niveau_risque').annotate(count=Count('id'))
        
        return {
            'total_analyses': total_analyses,
            'score_moyen': round(score_moyen, 1),
            'derniere_analyse': {
                'date': derniere.date_analyse if derniere else None,
                'score': derniere.score_sante if derniere else 0,
                'etat': derniere.niveau_risque if derniere else 'inconnu',
                'parcelle': derniere.parcelle.nom if derniere else None,
            } if derniere else None,
            'evolution': evolution,
            'repartition_etats': list(etats),
        }