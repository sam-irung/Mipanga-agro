# backend/ia/services.py

import google.generativeai as genai
from django.conf import settings
import json
import os

class IAService:
    """
    Service d'intégration avec Google Gemini AI
    """
    
    def __init__(self):
        # Configurer Gemini avec la clé API
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("❌ GEMINI_API_KEY non trouvée dans .env")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyser_parcelle(self, parcelle, meteo, calendrier):
        """
        Analyse une parcelle et génère des recommandations intelligentes
        """
        # 1. Construire le contexte
        prompt = self._construire_prompt_analyse(parcelle, meteo, calendrier)
        
        # 2. Appeler Gemini
        try:
            response = self.model.generate_content(prompt)
            return self._parser_reponse(response.text)
        except Exception as e:
            print(f"❌ Erreur Gemini: {e}")
            return {
                'error': "Erreur lors de l'analyse par l'IA",
                'details': str(e)
            }
    
    def _construire_prompt_analyse(self, parcelle, meteo, calendrier):
        """
        Construit le prompt pour l'analyse de parcelle
        """
        # Récupérer les informations
        culture = parcelle.culture.nom
        age = parcelle.age()
        statut = parcelle.get_statut_display()
        
        # Météo
        temp = meteo.get('temp_max', 'N/A')
        pluie = meteo.get('pluie', 'N/A')
        humidite = meteo.get('humidite', 'N/A')
        
        # Prochaine étape
        prochaine_etape = calendrier.get('prochaine', None)
        etape_nom = prochaine_etape.etape.nom if prochaine_etape else "Aucune"
        date_prevue = prochaine_etape.date_prevue if prochaine_etape else "Non définie"
        
        # Nombre d'étapes réalisées
        stats = calendrier.get('stats', {})
        etapes_realisees = stats.get('realisees', 0)
        etapes_total = stats.get('total', 0)
        
        prompt = f"""
Tu es un ingénieur agronome expert en agriculture tropicale, spécialisé en RDC.

Analyse cette parcelle agricole et donne des recommandations précises.

---

📋 INFORMATIONS DE LA PARCELLE

Culture : {culture}
Âge de la culture : {age} jours
Statut : {statut}
Prochaine étape : {etape_nom} (prévue le {date_prevue})
Étapes réalisées : {etapes_realisees}/{etapes_total}

🌤 CONDITIONS MÉTÉO ACTUELLES

Température maximale : {temp}°C
Précipitations : {pluie} mm
Humidité : {humidite}%

---

🎯 INSTRUCTIONS

Analyse la situation et fournis :

1. **niveau_risque** : "faible" | "moyen" | "élevé"
2. **recommandation** : une recommandation courte (max 100 caractères)
3. **explication** : pourquoi cette recommandation (max 150 caractères)
4. **action_prioritaire** : l'action la plus importante à faire aujourd'hui
5. **dans_7_jours** : ce qu'il faut surveiller dans les 7 prochains jours

📝 RÈGLES DE RÉPONSE

- Réponds UNIQUEMENT en JSON valide
- Utilise des guillemets doubles pour les clés et les valeurs
- Ne mets pas de commentaires dans le JSON

Exemple de réponse attendue :
{{
  "niveau_risque": "moyen",
  "recommandation": "Reporter la fertilisation de 48h",
  "explication": "Forte pluie prévue demain, risque de lessivage des engrais",
  "action_prioritaire": "Surveiller l'humidité du sol",
  "dans_7_jours": "Prévoir un apport d'engrais après la pluie"
}}

📌 ANALYSE :

"""
        return prompt
    
    def _parser_reponse(self, reponse):
        """
        Parse la réponse JSON de Gemini
        """
        try:
            # Nettoyer la réponse (enlever les marqueurs Markdown)
            reponse = reponse.replace('```json', '').replace('```', '').strip()
            return json.loads(reponse)
        except json.JSONDecodeError as e:
            print(f"❌ Erreur de parsing JSON: {e}")
            print(f"Réponse reçue: {reponse[:200]}...")
            return {
                'niveau_risque': 'inconnu',
                'recommandation': 'Erreur de parsing',
                'explication': "L'IA a renvoyé une réponse invalide",
                'action_prioritaire': "Vérifier les données",
                'dans_7_jours': "Consulter un agronome"
            }


# Instance unique du service
ia_service = IAService()