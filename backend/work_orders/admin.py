from django.contrib import admin

from .models import WorkOrder


@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = (
        "work_order_code",
        "title",
        "asset",
        "assigned_technician",
        "priority",
        "status",
        "progress_percentage",
        "scheduled_date",
        "created_at",
    )
    list_filter = ("priority", "status", "scheduled_date", "created_at")
    search_fields = (
        "work_order_code",
        "title",
        "description",
        "asset__asset_code",
        "asset__name",
        "assigned_technician__username",
    )
    ordering = ("-created_at",)