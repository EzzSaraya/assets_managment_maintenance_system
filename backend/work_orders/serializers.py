from rest_framework import serializers

from .models import WorkOrder


class WorkOrderSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source="asset.asset_code", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    service_request_title = serializers.CharField(
        source="service_request.issue_title",
        read_only=True
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    assigned_technician_username = serializers.CharField(
        source="assigned_technician.username",
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
        model = WorkOrder
        fields = [
            "id",
            "work_order_code",
            "service_request",
            "service_request_title",
            "asset",
            "asset_code",
            "asset_name",
            "created_by",
            "created_by_username",
            "assigned_technician",
            "assigned_technician_username",
            "title",
            "description",
            "priority",
            "priority_display",
            "status",
            "status_display",
            "scheduled_date",
            "completion_date",
            "technician_notes",
            "manager_notes",
            "progress_percentage",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "asset_code",
            "asset_name",
            "service_request_title",
            "assigned_technician_username",
            "priority_display",
            "status_display",
            "created_at",
            "updated_at",
        ]

    def validate_progress_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Progress percentage must be between 0 and 100."
            )
        return value