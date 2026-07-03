from django.contrib import admin

from .models import MaintenanceSchedule


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "schedule_code",
        "title",
        "asset",
        "assigned_technician",
        "frequency",
        "priority",
        "status",
        "next_due_date",
        "last_completed_date",
    )
    list_filter = (
        "frequency",
        "priority",
        "status",
        "next_due_date",
        "last_completed_date",
    )
    search_fields = (
        "schedule_code",
        "title",
        "asset__asset_code",
        "asset__name",
        "assigned_technician__username",
    )
    ordering = ("next_due_date",)