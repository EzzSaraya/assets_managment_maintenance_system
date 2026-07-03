from django.contrib import admin
from django.urls import include, path

from .api_views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("assets.urls")),
    path("api/", include("service_requests.urls")),
    path("api/", include("work_orders.urls")),
    path("api/", include("maintenance.urls")),
]