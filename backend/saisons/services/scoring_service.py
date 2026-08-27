# backend/saisons/services/scoring_service.py

from django.db.models import Q
from datetime import date
from cultures.models import Culture, ProfilClimatique, CalendrierZone
from saisons.models import ScoreCultureSaison, ProfilSaison

class ScoringService:
    """
    Moteur de scoring avancé des cultures
    """

    @staticmethod
    def calculer_scores(profil_saison):
        """
        Calcule les scores pour toutes les cultures actives
        """
        cultures = Culture.objects.filter(active=True)
        scores = []

        for culture in cultures:
            score = ScoringService._calculer_score_culture(culture, profil_saison)
            if score:
                scores.append(score)

        return scores

    @staticmethod
    def _calculer_score_culture(culture, profil_saison):
        """
        Calcule le score d'une culture avec multiples critères
        """
        profil_climat = ProfilClimatique.objects.filter(culture=culture).first()

        if not profil_climat:
            return None

        # 1. Score pluie (pondéré 35%)
        score_pluie = ScoringService._score_pluie(profil_climat, profil_saison)

        # 2. Score température (pondéré 25%)
        score_temperature = ScoringService._score_temperature(profil_climat, profil_saison)

        # 3. Score durée du cycle (pondéré 15%)
        score_duree = ScoringService._score_duree_cycle(culture, profil_saison)

        # 4. Score période de semis (pondéré 15%)
        score_semis = ScoringService._score_periode_semis(culture, profil_saison)

        # 5. Score tolérance (pondéré 10%)
        score_tolerance = ScoringService._score_tolerance(profil_climat, profil_saison)

        # Score global pondéré
        score_global = (
            (score_pluie * 0.35) +
            (score_temperature * 0.25) +
            (score_duree * 0.15) +
            (score_semis * 0.15) +
            (score_tolerance * 0.10)
        )

        # Niveau
        if score_global >= 70:
            niveau = 'favorable'
        elif score_global >= 50:
            niveau = 'attention'
        else:
            niveau = 'defavorable'

        return {
            'culture': culture,
            'score_pluie': round(score_pluie, 1),
            'score_temperature': round(score_temperature, 1),
            'score_duree': round(score_duree, 1),
            'score_semis': round(score_semis, 1),
            'score_tolerance': round(score_tolerance, 1),
            'score_global': round(score_global, 1),
            'niveau': niveau,
            'details': {
                'pluie': {
                    'min': profil_climat.besoin_eau_min,
                    'max': profil_climat.besoin_eau_max,
                },
                'temperature': {
                    'min': profil_climat.temp_min,
                    'max': profil_climat.temp_max,
                    'opt_min': profil_climat.temp_opt_min,
                    'opt_max': profil_climat.temp_opt_max,
                },
                'duree_cycle': {
                    'min': culture.duree_min,
                    'max': culture.duree_max,
                }
            }
        }

    @staticmethod
    def _score_pluie(profil_climat, profil_saison):
        """
        Score de pluie (0-100) - 35%
        """
        # Pluie attendue selon la tendance
        pluie_reference = 600
        if profil_saison.pluie_tendance == 'au_dessus':
            pluie_attendue = pluie_reference * 1.3
        elif profil_saison.pluie_tendance == 'en_dessous':
            pluie_attendue = pluie_reference * 0.7
        else:
            pluie_attendue = pluie_reference

        besoin_min = profil_climat.besoin_eau_min
        besoin_max = profil_climat.besoin_eau_max

        # Bonus pour tolérance
        bonus = 0
        if profil_saison.pluie_tendance == 'en_dessous' and profil_climat.tolerance_secheresse >= 2:
            bonus = 10
        elif profil_saison.pluie_tendance == 'au_dessus' and profil_climat.tolerance_exces_eau >= 2:
            bonus = 10

        if besoin_min <= pluie_attendue <= besoin_max:
            milieu = (besoin_min + besoin_max) / 2
            ecart = abs(pluie_attendue - milieu)
            if ecart < 50:
                return min(100, 85 + bonus)
            return min(100, 70 + bonus)
        elif pluie_attendue < besoin_min:
            ecart = besoin_min - pluie_attendue
            return max(0, 70 - (ecart / 5) + bonus)
        else:
            ecart = pluie_attendue - besoin_max
            return max(0, 70 - (ecart / 5) + bonus)

    @staticmethod
    def _score_temperature(profil_climat, profil_saison):
        """
        Score de température (0-100) - 25%
        """
        temp_reference = 25
        if profil_saison.temperature_tendance == 'au_dessus':
            temp_attendue = temp_reference + 2
        elif profil_saison.temperature_tendance == 'en_dessous':
            temp_attendue = temp_reference - 2
        else:
            temp_attendue = temp_reference

        if profil_climat.temp_min <= temp_attendue <= profil_climat.temp_max:
            if profil_climat.temp_opt_min <= temp_attendue <= profil_climat.temp_opt_max:
                return 95
            return 80
        elif temp_attendue < profil_climat.temp_min:
            ecart = profil_climat.temp_min - temp_attendue
            return max(0, 80 - (ecart * 10))
        else:
            ecart = temp_attendue - profil_climat.temp_max
            return max(0, 80 - (ecart * 10))

    @staticmethod
    def _score_duree_cycle(culture, profil_saison):
        """
        Score de durée du cycle (0-100) - 15%
        """
        # Durée estimée de la saison (en jours)
        # TODO: Remplacer par données réelles Open-Meteo
        duree_saison = 150  # jours

        duree_min = culture.duree_min
        duree_max = culture.duree_max
        duree_moyenne = (duree_min + duree_max) / 2

        if duree_max <= duree_saison:
            if duree_moyenne <= duree_saison * 0.7:
                return 95
            return 85
        elif duree_min <= duree_saison:
            return 60
        else:
            return 30

    @staticmethod
    def _score_periode_semis(culture, profil_saison):
        """
        Score de période de semis (0-100) - 15%
        """
        from cultures.models import CalendrierZone, ZoneAgricole

        zone = ZoneAgricole.objects.first()
        if not zone:
            return 50

        calendrier = CalendrierZone.objects.filter(
            culture=culture,
            zone=zone,
            actif=True
        ).first()

        if not calendrier:
            return 50

        jour_actuel = date.today().timetuple().tm_yday

        if calendrier.semis_debut_jour <= jour_actuel <= calendrier.semis_fin_jour:
            return 90
        elif jour_actuel < calendrier.semis_debut_jour:
            jours_restants = calendrier.semis_debut_jour - jour_actuel
            if jours_restants < 30:
                return 70
            return 50
        else:
            return 40

    @staticmethod
    def _score_tolerance(profil_climat, profil_saison):
        """
        Score de tolérance (0-100) - 10%
        """
        score = 70

        # Bonus pour tolérance à la sécheresse si saison sèche
        if profil_saison.pluie_tendance == 'en_dessous':
            if profil_climat.tolerance_secheresse == 3:
                score += 20
            elif profil_climat.tolerance_secheresse == 2:
                score += 10

        # Bonus pour tolérance à l'excès d'eau si saison humide
        if profil_saison.pluie_tendance == 'au_dessus':
            if profil_climat.tolerance_exces_eau == 3:
                score += 20
            elif profil_climat.tolerance_exces_eau == 2:
                score += 10

        return min(100, score)

    @staticmethod
    def sauvegarder_scores(profil_saison):
        """
        Sauvegarde les scores en base de données
        """
        scores = ScoringService.calculer_scores(profil_saison)

        created = []
        for score_data in scores:
            if not score_data:
                continue

            score, _ = ScoreCultureSaison.objects.update_or_create(
                profil_saison=profil_saison,
                culture=score_data['culture'],
                defaults={
                    'score_pluie': score_data['score_pluie'],
                    'score_temperature': score_data['score_temperature'],
                    'score_global': score_data['score_global'],
                    'niveau': score_data['niveau'],
                    'details': score_data['details']
                }
            )
            created.append(score)

        return created