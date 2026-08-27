# backend/recommandations/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecommandationViewSet, RegleAgronomiqueViewSet

router = DefaultRouter()
router.register('', RecommandationViewSet, basename='recommandation')

urlpatterns = [
    path('', include(router.urls)),
    path('regles/', RegleAgronomiqueViewSet.as_view({'get': 'list'}), name='regles'),
]