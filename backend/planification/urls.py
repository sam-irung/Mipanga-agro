# backend/planification/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalendrierViewSet

router = DefaultRouter()
router.register('', CalendrierViewSet, basename='calendrier')

urlpatterns = [
    path('', include(router.urls)),
]