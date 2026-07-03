from rest_framework import serializers

from .models import MaintenanceSchedule


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source="asset.asset_code", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    assigned_technician_username = serializers.CharField(
        source="assigned_technician.username",
        read_only=True
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    frequency_display = serializers.CharField(
        source="get_frequency_display",
        read_only=True
    )

    priority_display = serializers.CharField(
        source="get_priority_display",
        read_only=True
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = MaintenanceSchedule
        fields = [
            "id",
            "schedule_code",
            "asset",
            "asset_code",
            "asset_name",
            "assigned_technician",
            "assigned_technician_username",
            "created_by",
            "created_by_username",
            "title",
            "description",
            "frequency",
            "frequency_display",
            "priority",
            "priority_display",
            "status",
            "status_display",
            "next_due_date",
            "last_completed_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "asset_code",
            "asset_name",
            "assigned_technician_username",
            "created_by",
            "created_by_username",
            "frequency_display",
            "priority_display",
            "status_display",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        next_due_date = attrs.get("next_due_date")
        last_completed_date = attrs.get("last_completed_date")

        if last_completed_date and next_due_date:
            if last_completed_date > next_due_date:
                raise serializers.ValidationError(
                    "Last completed date cannot be after the next due date."
                )

        return attrs