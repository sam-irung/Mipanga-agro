# backend/recommandations/services/repository.py

from recommandations.models import Recommandation, HistoriqueRecommandation

class RecommendationRepository:
    """
    Repository pour les recommandations
    """

    @staticmethod
    def obtenir_actives(parcelle, limit=10):
        """
        Récupère les recommandations actives pour une parcelle
        """
        return Recommandation.objects.filter(
            parcelle=parcelle,
            active=True
        )[:limit]

    @staticmethod
    def obtenir_priorisees(parcelle):
        """
        Récupère les recommandations triées par priorité
        """
        # Ordre de priorité: critique > important > conseil
        ordre = {'critique': 0, 'important': 1, 'conseil': 2}
        recs = Recommandation.objects.filter(
            parcelle=parcelle,
            active=True
        )
        return sorted(recs, key=lambda r: ordre.get(r.niveau, 3))

    @staticmethod
    def obtenir_statistiques(parcelle):
        """
        Retourne les statistiques des recommandations
        """
        recs = Recommandation.objects.filter(parcelle=parcelle, active=True)
        total = recs.count()
        critiques = recs.filter(niveau='critique').count()
        importants = recs.filter(niveau='important').count()
        conseils = recs.filter(niveau='conseil').count()

        return {
            'total': total,
            'critiques': critiques,
            'importants': importants,
            'conseils': conseils
        }

    @staticmethod
    def obtenir_historique(parcelle, limit=20):
        """
        Récupère l'historique complet des recommandations
        """
        return Recommandation.objects.filter(
            parcelle=parcelle
        ).order_by('-date')[:limit]

    @staticmethod
    def marquer_lue(recommandation_id, utilisateur=None):
        """
        Marque une recommandation comme lue
        """
        try:
            rec = Recommandation.objects.get(id=recommandation_id)
            ancienne_valeur = rec.lue

            rec.lue = True
            rec.save()

            if ancienne_valeur != rec.lue:
                HistoriqueRecommandation.objects.create(
                    recommandation=rec,
                    champ='lue',
                    ancienne_valeur={'lue': ancienne_valeur},
                    nouvelle_valeur={'lue': rec.lue},
                    utilisateur=utilisateur
                )

            return rec
        except Recommandation.DoesNotExist:
            return None

    @staticmethod
    def marquer_appliquee(recommandation_id, utilisateur=None):
        """
        Marque une recommandation comme appliquée
        """
        try:
            rec = Recommandation.objects.get(id=recommandation_id)
            anciennes_valeurs = {'lue': rec.lue, 'appliquee': rec.appliquee}

            rec.appliquee = True
            rec.lue = True
            rec.save()

            HistoriqueRecommandation.objects.create(
                recommandation=rec,
                champ='appliquee',
                ancienne_valeur=anciennes_valeurs,
                nouvelle_valeur={'lue': rec.lue, 'appliquee': rec.appliquee},
                utilisateur=utilisateur
            )

            return rec
        except Recommandation.DoesNotExist:
            return None