# backend/ia/prompts.py

class PromptService:
    """
    Centralise tous les prompts pour l'IA
    """
    
    @staticmethod
    def analyse_parcelle(parcelle, meteo, calendrier):
        """
        Prompt pour l'analyse de parcelle
        """
        culture = parcelle.culture.nom
        age = parcelle.age()
        statut = parcelle.get_statut_display()
        superficie = parcelle.superficie
        
        # Météo
        temp = meteo.get('temp_max', 'N/A')
        pluie = meteo.get('pluie', 'N/A')
        humidite = meteo.get('humidite', 'N/A')
        
        # Calendrier
        stats = calendrier.get('stats', {})
        etapes_realisees = stats.get('realisees', 0)
        etapes_total = stats.get('total', 0)
        progression = stats.get('progression', 0)
        
        prochaine = calendrier.get('prochaine', None)
        prochaine_etape = prochaine.etape.nom if prochaine else "Aucune"
        date_prevue = prochaine.date_prevue if prochaine else "Non définie"
        
        return f"""
Tu es un ingénieur agronome expert en agriculture tropicale, spécialisé en RDC.

Analyse cette parcelle agricole et donne des recommandations précises.

---

📋 INFORMATIONS DE LA PARCELLE

Culture : {culture}
Âge de la culture : {age} jours
Superficie : {superficie} ha
Statut : {statut}
Prochaine étape : {prochaine_etape} (prévue le {date_prevue})
Étapes réalisées : {etapes_realisees}/{etapes_total}
Progression : {progression}%

🌤 CONDITIONS MÉTÉO ACTUELLES

Température maximale : {temp}°C
Précipitations : {pluie} mm
Humidité : {humidite}%

---

🎯 INSTRUCTIONS

Analyse la situation et fournis :

1. **niveau_risque** : "faible" | "moyen" | "élevé"
2. **score_sante** : un score de 0 à 100 (100 = excellent)
3. **recommandation** : une recommandation courte (max 100 caractères)
4. **explication** : pourquoi cette recommandation (max 150 caractères)
5. **action_prioritaire** : l'action la plus importante à faire aujourd'hui
6. **dans_7_jours** : ce qu'il faut surveiller dans les 7 prochains jours
7. **problemes_detectes** : liste des problèmes (ou tableau vide)

📝 RÈGLES DE RÉPONSE

- Réponds UNIQUEMENT en JSON valide
- Utilise des guillemets doubles
- Ne mets pas de commentaires

Exemple de réponse attendue :
{{
  "niveau_risque": "moyen",
  "score_sante": 78,
  "recommandation": "Reporter la fertilisation de 48h",
  "explication": "Forte pluie prévue demain (35mm), risque de lessivage des engrais",
  "action_prioritaire": "Surveiller l'humidité du sol et attendre la pluie",
  "dans_7_jours": "Prévoir un apport d'engrais après la pluie et surveiller les feuilles",
  "problemes_detectes": ["Risque de lessivage des engrais", "Humidité élevée"]
}}

📌 ANALYSE :
"""
        return prompt
    
    @staticmethod
    def analyse_image(parcelle=None):
        """
        Prompt pour l'analyse d'image de plante
        """
        prompt = """
Tu es un expert agronome spécialisé en phytopathologie et en agriculture tropicale.

Analyse cette photo de plante et donne un diagnostic précis.

---

🎯 INSTRUCTIONS

1. **etat** : "sain" ou "anormal"
2. **maladie** : nom de la maladie (ou "aucune")
3. **carence** : carence probable (ou "aucune")
4. **ravageur** : ravageur probable (ou "aucun")
5. **confiance** : niveau de confiance (0 à 100)
6. **score_sante** : score de santé global (0 à 100)
7. **description** : description détaillée de ce que tu vois
8. **conseil** : recommandations pour traiter le problème
9. **actions_recommandees** : liste d'actions à réaliser

📝 RÈGLES DE RÉPONSE

- Réponds UNIQUEMENT en JSON valide
- Utilise des guillemets doubles
- Ne mets pas de commentaires

Exemple de réponse :
{
  "etat": "anormal",
  "maladie": "Mildiou du maïs",
  "carence": "Azote",
  "ravageur": "Aucun",
  "confiance": 85,
  "score_sante": 62,
  "description": "Présence de taches jaunâtres sur les feuilles, caractéristiques du mildiou. Les feuilles inférieures sont les plus touchées.",
  "conseil": "Appliquer un fongicide à base de cuivre, éliminer les feuilles infectées.",
  "actions_recommandees": [
    "Appliquer un fongicide à base de cuivre",
    "Éliminer les feuilles infectées",
    "Surveiller les plants voisins"
  ]
}
"""
        
        if parcelle:
            prompt += f"""
            
📋 CONTEXTE DE LA PARCELLE :
- Culture : {parcelle.culture.nom}
- Âge : {parcelle.age()} jours
- Stade : {parcelle.get_statut_display()}
- Superficie : {parcelle.superficie} ha
"""
            return prompt

        
    @staticmethod
    def chat_agricole(parcelle, question, contexte, historique=None):
        """
        Prompt pour l'assistant IA conversationnel
        """
        prompt = f"""
Tu es un assistant agricole expert pour l'application Mipanga Agro.

Tu aides les agriculteurs en RDC à prendre les meilleures décisions pour leurs cultures.

---

📋 CONTEXTE DE LA PARCELLE

Culture : {contexte.get('culture', 'Inconnue')}
Âge : {contexte.get('age', 0)} jours
Statut : {contexte.get('statut', 'Inconnu')}
Superficie : {contexte.get('superficie', 0)} ha

🌤 MÉTÉO ACTUELLE
Température : {contexte.get('meteo', {}).get('temp_max', 'N/A')}°C
Pluie : {contexte.get('meteo', {}).get('pluie', 'N/A')} mm
Humidité : {contexte.get('meteo', {}).get('humidite', 'N/A')}%

📅 CALENDRIER
Progression : {contexte.get('calendrier', {}).get('progression', 0)}%
Prochaine étape : {contexte.get('calendrier', {}).get('prochaine_etape', 'Aucune')}

📷 DERNIÈRES ANALYSES
"""
        
        for a in contexte.get('dernieres_analyses', [])[:3]:
            date_str = a.get('date').strftime('%d/%m/%Y') if a.get('date') else 'Date inconnue'
            prompt += f"- {date_str}: Score {a.get('score', 'N/A')}% - {a.get('diagnostic', 'N/A')}\n"
        
        if historique:
            prompt += f"\n📝 HISTORIQUE DE LA CONVERSATION :\n{historique}\n"
        
        prompt += f"""

---

❓ QUESTION DE L'AGRICULTEUR :

{question}

---

🎯 INSTRUCTIONS

1. Réponds de manière claire, concise et pratique
2. Utilise un ton professionnel mais accessible
3. Si la question concerne une décision (arroser, fertiliser, traiter), donne une recommandation claire
4. Si tu manques d'informations, demande des précisions
5. Réponds en français
6. Structure ta réponse avec des parties claires si nécessaire

📌 RÉPONSE :
"""
        
        return prompt