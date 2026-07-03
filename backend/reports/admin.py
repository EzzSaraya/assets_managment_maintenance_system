from django.contrib import admin

from .models import MaintenanceHistory


@admin.register(MaintenanceHistory)
class MaintenanceHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "history_code",
        "title",
        "asset",
        "maintenance_type",
        "performed_by",
        "completion_date",
        "cost",
        "downtime_hours",
    )
    list_filter = (
        "maintenance_type",
        "completion_date",
        "created_at",
    )
    search_fields = (
        "history_code",
        "title",
        "asset__asset_code",
        "asset__name",
        "performed_by__username",
    )
    ordering = ("-completion_date",)