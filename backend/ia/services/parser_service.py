# backend/ia/services/parser_service.py

import json
import re

class ParserService:
    """
    Parse les réponses de Gemini
    """
    
    @staticmethod
    def parser_analyse(reponse):
        """
        Parse la réponse d'analyse de parcelle
        """
        try:
            # Nettoyer la réponse
            reponse = reponse.replace('```json', '').replace('```', '').strip()
            data = json.loads(reponse)
            
            # Structure minimale
            return {
                'niveau_risque': data.get('niveau_risque', 'inconnu'),
                'score_sante': data.get('score_sante', 50),
                'recommandation': data.get('recommandation', 'Aucune recommandation'),
                'explication': data.get('explication', 'Aucune explication'),
                'action_prioritaire': data.get('action_prioritaire', 'Aucune action prioritaire'),
                'dans_7_jours': data.get('dans_7_jours', 'Aucune prévision'),
                'problemes_detectes': data.get('problemes_detectes', [])
            }
        except json.JSONDecodeError:
            return ParserService._parser_fallback(reponse, 'analyse')
        except Exception as e:
            print(f"❌ Erreur parsing: {e}")
            return ParserService._parser_fallback(reponse, 'analyse')
    
    @staticmethod
    def parser_image(reponse):
        """
        Parse la réponse d'analyse d'image
        """
        try:
            reponse = reponse.replace('```json', '').replace('```', '').strip()
            data = json.loads(reponse)
            
            return {
                'etat': data.get('etat', 'inconnu'),
                'maladie': data.get('maladie', 'Inconnue'),
                'carence': data.get('carence', 'Inconnue'),
                'ravageur': data.get('ravageur', 'Inconnu'),
                'confiance': data.get('confiance', 0),
                'score_sante': data.get('score_sante', 50),
                'description': data.get('description', 'Aucune description'),
                'conseil': data.get('conseil', 'Aucun conseil'),
                'actions_recommandees': data.get('actions_recommandees', [])
            }
        except json.JSONDecodeError:
            return ParserService._parser_fallback(reponse, 'image')
        except Exception as e:
            print(f"❌ Erreur parsing: {e}")
            return ParserService._parser_fallback(reponse, 'image')
    
    @staticmethod
    def _parser_fallback(reponse, type_analyse):
        """
        Parse une réponse non-JSON
        """
        return {
            'erreur_parsing': True,
            'type': type_analyse,
            'reponse_brute': reponse[:500],
            'message': "La réponse de l'IA n'était pas au format JSON attendu"
        }