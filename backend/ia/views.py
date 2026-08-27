# backend/ia/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .services.recommendation_service import RecommendationService
from .services.vision_service import VisionService
from .services.chat_service import ChatService
from .models import AnalyseImage
from parcelles.models import Parcelle
from planification.services import CalendrierService
from meteo.services import WeatherService
from .services.chat_service import ChatService

class AnalyseParcelleView(APIView):
    """
    API pour analyser une parcelle avec l'IA
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parcelle_id = request.query_params.get('parcelle_id')

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Récupérer la météo
        meteo = {}
        if parcelle.latitude and parcelle.longitude:
            meteo_jour = WeatherService.get_meteo_jour(
                parcelle.latitude,
                parcelle.longitude
            )
            if not isinstance(meteo_jour, dict) or 'error' not in meteo_jour:
                meteo = meteo_jour

        # Récupérer le calendrier
        stats = CalendrierService.obtenir_statistiques(parcelle)
        prochaine = CalendrierService.obtenir_prochaine_etape(parcelle)
        
        calendrier = {
            'stats': stats,
            'prochaine': prochaine
        }

        # Analyser avec l'IA
        resultat = RecommendationService.analyser(parcelle, meteo, calendrier)

        return Response(resultat)

class AnalyseImageView(APIView):
    """
    API pour analyser une image de plante avec l'IA
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        import time
        start_time = time.time()
        
        image = request.FILES.get('image')
        parcelle_id = request.data.get('parcelle_id')

        if not image:
            return Response(
                {'error': 'Image requise'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Récupérer la météo pour le contexte
        meteo = {}
        if parcelle.latitude and parcelle.longitude:
            meteo_jour = WeatherService.get_meteo_jour(
                parcelle.latitude,
                parcelle.longitude
            )
            if not isinstance(meteo_jour, dict) or 'error' not in meteo_jour:
                meteo = meteo_jour

        # Analyser l'image
        resultat = VisionService.analyser(image, parcelle)
        temps_execution = time.time() - start_time

        print("🔍 Résultat de l'analyse:", resultat)

        # ✅ Sauvegarder avec toutes les métadonnées
        if 'error' not in resultat:
            analyse = AnalyseImage.objects.create(
                parcelle=parcelle,
                utilisateur=request.user,
                image=image,
                resultat=resultat,
                score_sante=resultat.get('score_sante', 0),
                niveau_risque=resultat.get('etat', 'inconnu'),
                conseils=resultat.get('conseil', ''),
                modele_utilise='gemini-2.0-flash',
                temps_execution=temps_execution,
                meteo_contexte=meteo
            )
            
            return Response({
                'resultat': resultat,
                'parcelle': parcelle.nom,
                'parcelle_id': parcelle.id,
                'analyse_id': analyse.id,
                'temps_execution': round(temps_execution, 2)
            })

        return Response({
            'resultat': resultat,
            'parcelle': parcelle.nom,
            'parcelle_id': parcelle.id
        })

# backend/ia/views.py (ajouter)

class HistoriqueAnalysesView(APIView):
    """
    Récupère l'historique des analyses d'images avec statistiques
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        parcelle_id = request.query_params.get('parcelle_id')
        limit = int(request.query_params.get('limit', 20))

        queryset = AnalyseImage.objects.filter(
            utilisateur=request.user
        )

        if parcelle_id:
            try:
                parcelle = Parcelle.objects.get(
                    id=parcelle_id,
                    agriculteur=request.user
                )
                queryset = queryset.filter(parcelle=parcelle)
            except Parcelle.DoesNotExist:
                return Response(
                    {'error': 'Parcelle non trouvée'},
                    status=status.HTTP_404_NOT_FOUND
                )

        analyses = queryset[:limit]

        # ✅ Statistiques
        total = queryset.count()
        score_moyen = queryset.aggregate(Avg('score_sante'))['score_sante__avg'] or 0
        
        # Répartition des états
        etats = queryset.values('niveau_risque').annotate(count=Count('id'))

        return Response({
            'analyses': [
                {
                    'id': a.id,
                    'date': a.date_analyse,
                    'image': a.image.url if a.image else None,
                    'resultat': a.resultat,
                    'score_sante': a.score_sante,
                    'niveau_risque': a.niveau_risque,
                    'conseils': a.conseils,
                    'parcelle': a.parcelle.nom,
                    'parcelle_id': a.parcelle.id,
                    'temps_execution': a.temps_execution,
                    'meteo': a.meteo_contexte
                }
                for a in analyses
            ],
            'statistiques': {
                'total': total,
                'score_moyen': round(score_moyen, 1),
                'repartition_etats': list(etats)
            }
        })

class ChatIAView(APIView):
    """
    API pour l'assistant IA conversationnel
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        parcelle_id = request.data.get('parcelle_id')
        question = request.data.get('question')
        historique = request.data.get('historique', [])

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not question:
            return Response(
                {'error': 'question est requise'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Formater l'historique pour le prompt
        historique_texte = ""
        for msg in historique[-5:]:
            if msg.get('role') == 'user':
                historique_texte += f"Utilisateur: {msg.get('content')}\n"
            else:
                historique_texte += f"Assistant: {msg.get('content')}\n"

        resultat = ChatService.poser_question(
            parcelle=parcelle,
            question=question,
            historique_conversation=historique_texte
        )

        return Response(resultat)

class ChatIAView(APIView):
    """
    API pour l'assistant IA conversationnel
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        parcelle_id = request.data.get('parcelle_id')
        question = request.data.get('question')
        historique = request.data.get('historique', [])

        if not parcelle_id:
            return Response(
                {'error': 'parcelle_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not question:
            return Response(
                {'error': 'question est requise'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parcelle = Parcelle.objects.get(
                id=parcelle_id,
                agriculteur=request.user
            )
        except Parcelle.DoesNotExist:
            return Response(
                {'error': 'Parcelle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Formater l'historique pour le prompt
        historique_texte = ""
        for msg in historique[-5:]:
            if msg.get('role') == 'user':
                historique_texte += f"Utilisateur: {msg.get('content')}\n"
            else:
                historique_texte += f"Assistant: {msg.get('content')}\n"

        resultat = ChatService.poser_question(
            parcelle=parcelle,
            question=question,
            historique_conversation=historique_texte
        )

        return Response(resultat)