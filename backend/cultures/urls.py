# backend/cultures/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CultureViewSet

router = DefaultRouter()
router.register('', CultureViewSet, basename='culture')

urlpatterns = [
    path('', include(router.urls)),
]