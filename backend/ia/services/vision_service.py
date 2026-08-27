# backend/ia/services/vision_service.py

import base64
import io
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from .client import openrouter
from ..prompts import PromptService
from .parser_service import ParserService

class VisionService:
    """
    Service d'analyse d'images avec OpenRouter
    """
    
    @staticmethod
    def analyser(image_file, parcelle=None):
        """
        Analyse une photo de plante
        """
        # 1. Préparer l'image (base64)
        image_base64 = VisionService._preparer_image_base64(image_file)
        
        if not image_base64:
            return {
                'error': "L'image n'a pas pu être préparée",
                'etat': 'inconnu',
                'confiance': 0
            }
        
        # 2. Construire le prompt
        prompt = PromptService.analyse_image(parcelle)
        
        # 3. Appeler OpenRouter avec l'image
        response = openrouter.generate_with_image(prompt, image_base64)
        
        # 4. Vérifier la réponse
        if 'error' in response:
            return {
                'error': "L'IA n'a pas pu analyser l'image",
                'etat': 'inconnu',
                'confiance': 0,
                'description': "Erreur de communication avec l'IA",
                'conseil': "Veuillez réessayer"
            }
        
        # 5. Extraire le texte
        texte = openrouter.extract_text(response)
        
        if not texte or 'error' in texte:
            return {
                'error': "L'IA n'a pas pu analyser l'image",
                'etat': 'inconnu',
                'confiance': 0,
                'description': "Réponse de l'IA invalide",
                'conseil': "Veuillez réessayer"
            }
        
        # 6. Parser la réponse
        resultat = ParserService.parser_image(texte)
        
        return resultat
    
    @staticmethod
    def _preparer_image_base64(image_file):
        """
        Prépare l'image en base64 pour OpenRouter
        """
        try:
            # Lire l'image
            if isinstance(image_file, InMemoryUploadedFile):
                image_bytes = image_file.read()
            else:
                with open(image_file, 'rb') as f:
                    image_bytes = f.read()
            
            # Redimensionner si trop grande
            img = Image.open(io.BytesIO(image_bytes))
            if img.size[0] > 1024 or img.size[1] > 1024:
                img.thumbnail((1024, 1024))
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=80)
                image_bytes = buffer.getvalue()
            
            # Encoder en base64
            return base64.b64encode(image_bytes).decode('utf-8')
        except Exception as e:
            print(f"❌ Erreur préparation image: {e}")
            return None