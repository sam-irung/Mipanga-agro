from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActionRealiseeViewSet, NoteParcelleViewSet

router = DefaultRouter()
router.register('actions', ActionRealiseeViewSet, basename='action')
router.register('notes', NoteParcelleViewSet, basename='note')

urlpatterns = [
    path('', include(router.urls)),
]