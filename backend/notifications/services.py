# backend/notifications/services.py

from django.db.models import Q
from datetime import date, timedelta
from .models import Notification
from parcelles.models import Parcelle
from planification.models import Calendrier
from meteo.services import WeatherService

class NotificationService:
    """
    Service de gestion des notifications intelligentes
    """

    @staticmethod
    def generer_notifications(agriculteur):
        """
        Génère toutes les notifications pour un agriculteur
        """
        notifications = []

        # 1. Notifications météo
        notifications += NotificationService._notifications_meteo(agriculteur)

        # 2. Notifications calendrier
        notifications += NotificationService._notifications_calendrier(agriculteur)

        # 3. Notifications IA
        notifications += NotificationService._notifications_ia(agriculteur)

        # 4. Notifications de retard
        notifications += NotificationService._notifications_retard(agriculteur)

        return notifications

    @staticmethod
    def _notifications_meteo(agriculteur):
        """
        Notifications météo
        """
        notifications = []
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)

        for parcelle in parcelles:
            if not parcelle.latitude or not parcelle.longitude:
                continue

            meteo = WeatherService.get_meteo_jour(
                parcelle.latitude,
                parcelle.longitude
            )

            if isinstance(meteo, dict) and 'error' in meteo:
                continue

            # Pluie forte > 30mm
            if meteo.get('pluie', 0) > 30:
                notifications.append({
                    'parcelle': parcelle,
                    'type': 'meteo',
                    'titre': '⚠️ Forte pluie annoncée',
                    'message': f"Forte pluie de {meteo['pluie']}mm prévue demain sur {parcelle.nom}.",
                    'lien': f'/meteo?parcelle={parcelle.id}'
                })

            # Température élevée > 35°C
            if meteo.get('temp_max', 0) > 35:
                notifications.append({
                    'parcelle': parcelle,
                    'type': 'meteo',
                    'titre': '🌡️ Chaleur excessive',
                    'message': f"Température de {meteo['temp_max']}°C annoncée sur {parcelle.nom}.",
                    'lien': f'/meteo?parcelle={parcelle.id}'
                })

        return notifications

    @staticmethod
    def _notifications_calendrier(agriculteur):
        """
        Notifications calendrier
        """
        notifications = []
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)

        for parcelle in parcelles:
            # Prochaines étapes dans les 3 jours
            prochaines = Calendrier.objects.filter(
                parcelle=parcelle,
                statut__in=['a_venir', 'en_retard']
            ).order_by('date_prevue')

            for cal in prochaines[:2]:
                jours_restants = (cal.date_prevue - date.today()).days
                if 0 <= jours_restants <= 3:
                    notifications.append({
                        'parcelle': parcelle,
                        'type': 'rappel',
                        'titre': '📅 Étape à venir',
                        'message': f"{cal.etape.nom} sur {parcelle.nom} dans {jours_restants} jours.",
                        'lien': f'/calendrier?parcelle={parcelle.id}'
                    })

        return notifications

    @staticmethod
    def _notifications_ia(agriculteur):
        """
        Notifications IA
        """
        from ia.models import AnalyseImage

        notifications = []
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)

        for parcelle in parcelles:
            # Dernière analyse avec score bas
            derniere = AnalyseImage.objects.filter(
                parcelle=parcelle
            ).order_by('-date_analyse').first()

            if derniere and derniere.score_sante < 60:
                notifications.append({
                    'parcelle': parcelle,
                    'type': 'ia',
                    'titre': '🧠 Santé critique',
                    'message': f"La culture de {parcelle.nom} a un score de santé de {derniere.score_sante}%.",
                    'lien': f'/diagnostic?parcelle={parcelle.id}'
                })

        return notifications

    @staticmethod
    def _notifications_retard(agriculteur):
        """
        Notifications de retard
        """
        notifications = []
        parcelles = Parcelle.objects.filter(agriculteur=agriculteur)

        for parcelle in parcelles:
            etapes_retard = Calendrier.objects.filter(
                parcelle=parcelle,
                statut='en_retard'
            ).count()

            if etapes_retard > 0:
                notifications.append({
                    'parcelle': parcelle,
                    'type': 'alerte',
                    'titre': f'⚠️ {etapes_retard} étape(s) en retard',
                    'message': f"{etapes_retard} étapes sont en retard sur {parcelle.nom}.",
                    'lien': f'/calendrier?parcelle={parcelle.id}'
                })

        return notifications

    @staticmethod
    def sauvegarder_notifications(agriculteur):
        """
        Sauvegarde les notifications en base de données
        """
        # Supprimer les anciennes notifications non lues
        Notification.objects.filter(
            agriculteur=agriculteur,
            lue=False
        ).delete()

        notifications = NotificationService.generer_notifications(agriculteur)

        created = []
        for data in notifications:
            notif = Notification.objects.create(
                agriculteur=agriculteur,
                parcelle=data['parcelle'],
                type=data['type'],
                titre=data['titre'],
                message=data['message'],
                lien=data['lien']
            )
            created.append(notif)

        return created

    @staticmethod
    def obtenir_notifications(agriculteur, limit=20):
        """
        Récupère les notifications d'un agriculteur
        """
        return Notification.objects.filter(
            agriculteur=agriculteur
        )[:limit]

    @staticmethod
    def obtenir_non_lues(agriculteur):
        """
        Récupère les notifications non lues
        """
        return Notification.objects.filter(
            agriculteur=agriculteur,
            lue=False
        )

    @staticmethod
    def marquer_toutes_lues(agriculteur):
        """
        Marque toutes les notifications comme lues
        """
        Notification.objects.filter(
            agriculteur=agriculteur,
            lue=False
        ).update(lue=True)