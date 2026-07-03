from django.contrib import admin

from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        "asset_code",
        "name",
        "category",
        "status",
        "location",
        "created_at",
    )
    list_filter = ("category", "status", "location")
    search_fields = ("asset_code", "name", "serial_number", "location")
    ordering = ("asset_code",)