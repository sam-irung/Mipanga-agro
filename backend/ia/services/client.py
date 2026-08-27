# backend/ia/services/client.py

import os
import requests
import json

class OpenRouterClient:
    """
    Client pour l'API OpenRouter
    """
    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("❌ OPENROUTER_API_KEY non trouvée dans .env")
        print("✅ OpenRouter client initialisé")

    def generate(self, prompt, model="google/gemini-2.5-flash"):
        """
        Génère une réponse à partir d'un prompt
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Mipanga Agro"
        }

        data = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2048
        }

        try:
            response = requests.post(
                self.BASE_URL,
                headers=headers,
                json=data,
                timeout=60
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur OpenRouter: {e}")
            return {'error': str(e)}

    def generate_with_image(self, prompt, image_base64, model="google/gemini-2.5-flash"):
        """
        Génère une réponse avec une image
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Mipanga Agro"
        }

        # Construire le message avec image
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }
        ]

        data = {
            "model": model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048
        }

        try:
            response = requests.post(
                self.BASE_URL,
                headers=headers,
                json=data,
                timeout=120
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur OpenRouter: {e}")
            return {'error': str(e)}

    def extract_text(self, response):
        """
        Extrait le texte de la réponse OpenRouter
        """
        if 'error' in response:
            return response['error']
        
        if 'choices' in response and len(response['choices']) > 0:
            return response['choices'][0]['message']['content']
        
        return "Réponse non reconnue"

# Instance unique
openrouter = OpenRouterClient()