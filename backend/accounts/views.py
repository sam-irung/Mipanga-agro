# backend/accounts/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum
from parcelles.models import Parcelle
from planification.models import Calendrier
from recommandations.models import Recommandation
from .serializers import RegisterSerializer, ProfileSerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': ProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {'error': 'Identifiant et mot de passe requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(
                Q(username__iexact=identifier) |
                Q(email__iexact=identifier) |
                Q(telephone__iexact=identifier)
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Identifiants incorrects'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Identifiants incorrects'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Compte désactivé'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': ProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data)

    def put(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ NOUVEAU: Statistiques du profil
class ProfileStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Parcelles
        parcelles = Parcelle.objects.filter(agriculteur=user)
        total_parcelles = parcelles.count()
        surface_totale = sum(float(p.superficie) for p in parcelles)
        
        # Culture la plus fréquente
        culture_counts = parcelles.values('culture__nom').annotate(
            count=Count('id')
        ).order_by('-count')
        culture_principale = culture_counts[0]['culture__nom'] if culture_counts else "Aucune"
        
        # Étapes réalisées
        etapes_total = Calendrier.objects.filter(parcelle__agriculteur=user).count()
        etapes_realisees = Calendrier.objects.filter(
            parcelle__agriculteur=user,
            statut='realise'
        ).count()
        
        # Recommandations
        recommandations_total = Recommandation.objects.filter(
            parcelle__agriculteur=user,
            active=True
        ).count()
        recommandations_appliquees = Recommandation.objects.filter(
            parcelle__agriculteur=user,
            appliquee=True
        ).count()
        
        # Progression moyenne
        progression = 0
        if etapes_total > 0:
            progression = int((etapes_realisees / etapes_total) * 100)
        
        return Response({
            'total_parcelles': total_parcelles,
            'surface_totale': round(surface_totale, 2),
            'culture_principale': culture_principale,
            'etapes_total': etapes_total,
            'etapes_realisees': etapes_realisees,
            'progression': progression,
            'recommandations_total': recommandations_total,
            'recommandations_appliquees': recommandations_appliquees,
        })