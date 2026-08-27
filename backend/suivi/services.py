from datetime import date
from django.db import transaction
from .models import ActionRealisee, NoteParcelle
from planification.models import Calendrier
from recommandations.services import RecommendationGenerator

class SuiviService:
    """
    Service de suivi des actions agricoles
    """

    @staticmethod
    def marquer_etape_realisee(parcelle, etape_id, utilisateur, commentaire='', latitude=None, longitude=None):
        """
        Marque une étape comme réalisée
        """
        with transaction.atomic():
            # 1. Récupérer l'étape du calendrier
            try:
                calendrier = Calendrier.objects.get(
                    parcelle=parcelle,
                    etape_id=etape_id
                )
            except Calendrier.DoesNotExist:
                return None

            # 2. Vérifier si déjà réalisée
            if calendrier.realise:
                return {'error': 'Cette étape est déjà réalisée'}

            # 3. Marquer comme réalisée
            calendrier.realise = True
            calendrier.date_realisation = date.today()
            calendrier.statut = 'realise'
            calendrier.save()

            # 4. Créer l'action réalisée
            action = ActionRealisee.objects.create(
                parcelle=parcelle,
                etape=calendrier.etape,
                commentaire=commentaire,
                realise_par=utilisateur,
                latitude=latitude,
                longitude=longitude
            )

            # 5. Mettre à jour le statut de la parcelle
            toutes_etapes = Calendrier.objects.filter(parcelle=parcelle)
            toutes_realisees = all(e.realise for e in toutes_etapes)

            if toutes_realisees:
                parcelle.statut = 'recoltee'
                parcelle.save()

            # 6. Régénérer les recommandations
            RecommendationGenerator.sauvegarder(parcelle)

            return action

    @staticmethod
    def obtenir_historique(parcelle, limit=20):
        """
        Retourne l'historique des actions pour une parcelle
        """
        return ActionRealisee.objects.filter(
            parcelle=parcelle
        ).order_by('-date_realisation')[:limit]

    @staticmethod
    def ajouter_note(parcelle, type_note, titre, contenu, utilisateur, image=None):
        """
        Ajoute une note sur une parcelle
        """
        note = NoteParcelle.objects.create(
            parcelle=parcelle,
            type=type_note,
            titre=titre,
            contenu=contenu,
            auteur=utilisateur,
            image=image
        )
        return note

    @staticmethod
    def obtenir_notes(parcelle, type_note=None, limit=10):
        """
        Retourne les notes d'une parcelle, éventuellement filtrées par type
        """
        queryset = NoteParcelle.objects.filter(parcelle=parcelle)
        if type_note:
            queryset = queryset.filter(type=type_note)
        return queryset.order_by('-date')[:limit]

    @staticmethod
    def obtenir_statistiques_suivi(parcelle):
        """
        Retourne les statistiques de suivi pour une parcelle
        """
        total = Calendrier.objects.filter(parcelle=parcelle).count()
        realisees = Calendrier.objects.filter(parcelle=parcelle, realise=True).count()
        en_retard = Calendrier.objects.filter(
            parcelle=parcelle,
            realise=False,
            date_prevue__lt=date.today()
        ).count()

        dernieres_actions = ActionRealisee.objects.filter(
            parcelle=parcelle
        ).order_by('-date_realisation')[:3]

        return {
            'total_etapes': total,
            'etapes_realisees': realisees,
            'etapes_en_retard': en_retard,
            'progression': int((realisees / total) * 100) if total > 0 else 0,
            'dernieres_actions': dernieres_actions
        }