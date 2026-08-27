# backend/planification/services.py

from datetime import timedelta, date
from .models import Calendrier
from cultures.models import EtapeCulturelle
from parcelles.models import Parcelle

class CalendrierService:
    """
    Service de gestion du calendrier cultural
    """

    @staticmethod
    def creer_calendrier(parcelle):
        """
        Crée le calendrier complet pour une parcelle
        """
        etapes = EtapeCulturelle.objects.filter(
            culture=parcelle.culture
        ).order_by('ordre', 'decalage_min')

        calendrier = []
        for etape in etapes:
            jour = etape.decalage_min
            date_prevue = parcelle.date_semis + timedelta(days=jour)
            calendrier.append({
                'parcelle': parcelle,
                'etape': etape,
                'date_prevue': date_prevue,
                'date_originale': date_prevue,
                'statut': 'a_venir'
            })

        Calendrier.objects.filter(parcelle=parcelle).delete()

        created = []
        for data in calendrier:
            cal = Calendrier.objects.create(**data)
            created.append(cal)

        return created

    @staticmethod
    def mettre_a_jour_statuts(parcelle=None):
        """
        Met à jour les statuts des calendriers
        """
        queryset = Calendrier.objects.all()
        if parcelle:
            queryset = queryset.filter(parcelle=parcelle)

        for cal in queryset:
            cal.mettre_a_jour_statut()

    @staticmethod
    def obtenir_prochaine_etape(parcelle):
        """
        Retourne la prochaine étape à réaliser
        """
        return Calendrier.objects.filter(
            parcelle=parcelle,
            statut__in=['a_venir', 'en_retard']
        ).order_by('date_prevue').first()

    @staticmethod
    def obtenir_etape_courante(parcelle):
        """
        Retourne l'étape actuelle
        """
        prochaine = CalendrierService.obtenir_prochaine_etape(parcelle)
        derniere_realisee = Calendrier.objects.filter(
            parcelle=parcelle,
            statut='realise'
        ).order_by('-date_prevue').first()

        return {
            'derniere_realisee': derniere_realisee,
            'prochaine': prochaine
        }

    @staticmethod
    def obtenir_toutes_etapes(parcelle):
        """
        Retourne toutes les étapes du calendrier
        """
        return Calendrier.objects.filter(parcelle=parcelle).order_by('date_prevue')

    @staticmethod
    def obtenir_statistiques(parcelle):
        """
        Retourne les statistiques du calendrier
        """
        total = Calendrier.objects.filter(parcelle=parcelle).count()
        realisees = Calendrier.objects.filter(parcelle=parcelle, statut='realise').count()
        en_retard = Calendrier.objects.filter(parcelle=parcelle, statut='en_retard').count()

        return {
            'total': total,
            'realisees': realisees,
            'en_retard': en_retard,
            'progression': int((realisees / total) * 100) if total > 0 else 0
        }

    @staticmethod
    def marquer_realisee(parcelle, etape_id, commentaire=None):
        """
        Marque une étape comme réalisée
        """
        try:
            cal = Calendrier.objects.get(parcelle=parcelle, etape_id=etape_id)
        except Calendrier.DoesNotExist:
            return None

        if cal.statut == 'realise':
            return cal

        from datetime import date
        cal.statut = 'realise'
        cal.date_realisation = date.today()
        cal.save()

        return cal