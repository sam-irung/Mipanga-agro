from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/cultures/', include('cultures.urls')),
    path('api/parcelles/', include('parcelles.urls')),
    path('api/planification/', include('planification.urls')),
    path('api/meteo/', include('meteo.urls')),
    path('api/recommandations/', include('recommandations.urls')),
    path('api/suivi/', include('suivi.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/ia/', include('ia.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/saisons/', include('saisons.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
