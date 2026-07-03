from rest_framework import serializers

from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = Asset
        fields = [
            "id",
            "asset_code",
            "name",
            "category",
            "category_display",
            "status",
            "status_display",
            "location",
            "manufacturer",
            "serial_number",
            "purchase_date",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]