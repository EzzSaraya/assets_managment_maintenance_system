from django.contrib.auth.models import User
from rest_framework import serializers

from assets.models import Asset
from .models import ServiceRequest


class ServiceRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(
        source="requester.username",
        read_only=True
    )
    assigned_technician_username = serializers.CharField(
        source="assigned_technician.username",
        read_only=True
    )

    asset_code = serializers.CharField(
        source="asset.asset_code",
        read_only=True
    )
    asset_name = serializers.CharField(
        source="asset.name",
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
        model = ServiceRequest
        fields = [
            "id",
            "asset",
            "asset_code",
            "asset_name",
            "requester",
            "requester_username",
            "assigned_technician",
            "assigned_technician_username",
            "issue_title",
            "issue_description",
            "priority",
            "priority_display",
            "status",
            "status_display",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "requester",
            "requester_username",
            "asset_code",
            "asset_name",
            "priority_display",
            "status_display",
            "created_at",
            "updated_at",
        ]

    def validate_asset(self, value):
        if value.status == Asset.Status.RETIRED:
            raise serializers.ValidationError(
                "Cannot create a service request for a retired asset."
            )
        return value