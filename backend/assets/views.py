from rest_framework import filters, viewsets

from .models import Asset
from .permissions import AssetPermission
from .serializers import AssetSerializer


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [AssetPermission]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["asset_code", "name", "location", "serial_number"]
    ordering_fields = ["asset_code", "name", "category", "status", "created_at"]