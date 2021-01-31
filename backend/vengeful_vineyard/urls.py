from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from .views import GroupViewSet
from apps.punishment_system.views import PunishmentViewSet, PunishmentTypeViewSet, VineyardGroupViewSet, LeaderboardViewSet, VineyardUserViewSet

router = routers.DefaultRouter()
router.register(r'users', VineyardUserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'Punishment', PunishmentViewSet,)
router.register(r'PunishmentType', PunishmentTypeViewSet,)
router.register(r'VineyardGroup', VineyardGroupViewSet,)
router.register(
    r'VineyardGroup/(?P<VineyardGroup>[a-z0-9-]+)', LeaderboardViewSet, basename="leaderboard")
# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    #   path('punishment/', include(apps.punishment_system.urls))
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
