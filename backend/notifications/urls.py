# backend/notifications/urls.py

from django.urls import path
from .views import NotificationsView, NotificationsNonLuesView, MarquerLuesView

urlpatterns = [
    path('', NotificationsView.as_view(), name='notifications'),
    path('non-lues/', NotificationsNonLuesView.as_view(), name='notifications-non-lues'),
    path('marquer-lues/', MarquerLuesView.as_view(), name='marquer-lues'),
]