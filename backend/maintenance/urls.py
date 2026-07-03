from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaintenanceScheduleViewSet


router = DefaultRouter()
router.register(
    r"maintenance-schedules",
    MaintenanceScheduleViewSet,
    basename="maintenance-schedule"
)

urlpatterns = [
    path("", include(router.urls)),
]