from rest_framework import serializers

from .models import MaintenanceHistory


class MaintenanceHistorySerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source="asset.asset_code", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    work_order_code = serializers.CharField(
        source="work_order.work_order_code",
        read_only=True
    )

    schedule_code = serializers.CharField(
        source="maintenance_schedule.schedule_code",
        read_only=True
    )

    performed_by_username = serializers.CharField(
        source="performed_by.username",
        read_only=True
    )

    maintenance_type_display = serializers.CharField(
        source="get_maintenance_type_display",
        read_only=True
    )

    class Meta:
        model = MaintenanceHistory
        fields = [
            "id",
            "history_code",
            "asset",
            "asset_code",
            "asset_name",
            "work_order",
            "work_order_code",
            "maintenance_schedule",
            "schedule_code",
            "performed_by",
            "performed_by_username",
            "title",
            "description",
            "maintenance_type",
            "maintenance_type_display",
            "completion_date",
            "cost",
            "downtime_hours",
            "result_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "asset_code",
            "asset_name",
            "work_order_code",
            "schedule_code",
            "performed_by_username",
            "maintenance_type_display",
            "created_at",
            "updated_at",
        ]

    def validate_cost(self, value):
        if value < 0:
            raise serializers.ValidationError("Cost cannot be negative.")
        return value

    def validate_downtime_hours(self, value):
        if value < 0:
            raise serializers.ValidationError("Downtime hours cannot be negative.")
        return value