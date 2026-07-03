from django.contrib import admin

from .models import ServiceRequest


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "issue_title",
        "asset",
        "requester",
        "assigned_technician",
        "priority",
        "status",
        "created_at",
    )
    list_filter = ("priority", "status", "created_at")
    search_fields = (
        "issue_title",
        "issue_description",
        "asset__asset_code",
        "asset__name",
        "requester__username",
    )
    ordering = ("-created_at",)