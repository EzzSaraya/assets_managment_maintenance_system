from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaintenanceHistoryViewSet, reports_summary


router = DefaultRouter()
router.register(
    r"maintenance-history",
    MaintenanceHistoryViewSet,
    basename="maintenance-history"
)

urlpatterns = [
    path("", include(router.urls)),
    path("reports/summary/", reports_summary, name="reports_summary"),
]