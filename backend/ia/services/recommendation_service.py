# backend/ia/services/recommendation_service.py

from .client import openrouter
from ..prompts import PromptService
from .parser_service import ParserService

class RecommendationService:
    """
    Service d'analyse des parcelles avec l'IA
    """
    
    @staticmethod
    def analyser(parcelle, meteo, calendrier):
        """
        Analyse une parcelle et génère des recommandations
        """
        # 1. Construire le prompt
        prompt = PromptService.analyse_parcelle(parcelle, meteo, calendrier)
        
        # 2. Appeler OpenRouter
        response = openrouter.generate(prompt)
        
        # 3. Vérifier la réponse
        if 'error' in response:
            return {
                'error': "L'IA n'a pas pu analyser la parcelle",
                'niveau_risque': 'inconnu',
                'score_sante': 0,
                'recommandation': "Veuillez réessayer",
                'explication': f"Erreur: {response['error']}",
                'action_prioritaire': "Vérifier la connexion",
                'dans_7_jours': "Consulter un agronome",
                'problemes_detectes': []
            }
        
        # 4. Extraire le texte
        texte = openrouter.extract_text(response)
        
        if not texte or 'error' in texte:
            return {
                'error': "L'IA n'a pas pu analyser la parcelle",
                'niveau_risque': 'inconnu',
                'score_sante': 0,
                'recommandation': "Veuillez réessayer",
                'explication': "Réponse de l'IA invalide",
                'action_prioritaire': "Vérifier les données",
                'dans_7_jours': "Consulter un agronome",
                'problemes_detectes': []
            }
        
        # 5. Parser la réponse
        resultat = ParserService.parser_analyse(texte)
        
        return resultat