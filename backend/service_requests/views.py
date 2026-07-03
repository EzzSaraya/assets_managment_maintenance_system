from rest_framework import filters, viewsets

from .models import ServiceRequest
from .permissions import ServiceRequestPermission
from .serializers import ServiceRequestSerializer


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [ServiceRequestPermission]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "issue_title",
        "issue_description",
        "asset__asset_code",
        "asset__name",
        "requester__username",
    ]
    ordering_fields = ["created_at", "priority", "status"]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        queryset = ServiceRequest.objects.select_related(
            "asset",
            "requester",
            "assigned_technician"
        )

        if role in ["ADMIN", "MANAGER"]:
            return queryset

        if role == "EMPLOYEE":
            return queryset.filter(requester=user)

        if role == "TECHNICIAN":
            return queryset.filter(assigned_technician=user)

        return ServiceRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)