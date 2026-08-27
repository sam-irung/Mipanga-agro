# backend/ia/services/chat_service.py

from .client import openrouter
from ..prompts import PromptService

class ChatService:
    """
    Service d'assistant IA conversationnel
    """
    
    @staticmethod
    def poser_question(parcelle, question, historique_conversation=None):
        """
        Répond à une question de l'utilisateur en tenant compte du contexte
        """
        # 1. Récupérer le contexte de la parcelle
        contexte = ChatService._get_contexte_parcelle(parcelle)
        
        # 2. Construire le prompt
        prompt = PromptService.chat_agricole(
            parcelle=parcelle,
            question=question,
            contexte=contexte,
            historique=historique_conversation
        )
        
        # 3. Appeler OpenRouter
        response = openrouter.generate(prompt)
        
        if 'error' in response:
            return {
                'error': "Erreur de communication avec l'IA",
                'reponse': "Je n'ai pas pu répondre à votre question. Veuillez réessayer."
            }
        
        texte = openrouter.extract_text(response)
        
        return {
            'reponse': texte,
            'contexte': contexte
        }
    
    @staticmethod
    def _get_contexte_parcelle(parcelle):
        """
        Récupère toutes les informations d'une parcelle
        """
        from planification.services import CalendrierService
        from meteo.services import WeatherService
        from ..models import AnalyseImage
        
        # Météo
        meteo = {}
        if parcelle.latitude and parcelle.longitude:
            meteo_jour = WeatherService.get_meteo_jour(
                parcelle.latitude,
                parcelle.longitude
            )
            if not isinstance(meteo_jour, dict) or 'error' not in meteo_jour:
                meteo = meteo_jour
        
        # Calendrier
        stats = CalendrierService.obtenir_statistiques(parcelle)
        prochaine = CalendrierService.obtenir_prochaine_etape(parcelle)
        
        # Dernières analyses
        dernieres_analyses = AnalyseImage.objects.filter(
            parcelle=parcelle
        ).order_by('-date_analyse')[:3]
        
        return {
            'culture': parcelle.culture.nom,
            'age': parcelle.age(),
            'statut': parcelle.get_statut_display(),
            'superficie': float(parcelle.superficie),
            'meteo': meteo,
            'calendrier': {
                'progression': stats.get('progression', 0),
                'prochaine_etape': prochaine.etape.nom if prochaine else None,
                'date_prochaine': prochaine.date_prevue if prochaine else None
            },
            'dernieres_analyses': [
                {
                    'date': a.date_analyse,
                    'score': a.score_sante,
                    'diagnostic': a.resultat.get('etat', 'inconnu')
                }
                for a in dernieres_analyses
            ]
        }