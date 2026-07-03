from rest_framework import filters, viewsets

from .models import WorkOrder
from .permissions import WorkOrderPermission
from .serializers import WorkOrderSerializer


class WorkOrderViewSet(viewsets.ModelViewSet):
    serializer_class = WorkOrderSerializer
    permission_classes = [WorkOrderPermission]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "work_order_code",
        "title",
        "description",
        "asset__asset_code",
        "asset__name",
        "assigned_technician__username",
    ]
    ordering_fields = [
        "created_at",
        "scheduled_date",
        "completion_date",
        "priority",
        "status",
        "progress_percentage",
    ]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        queryset = WorkOrder.objects.select_related(
            "asset",
            "service_request",
            "created_by",
            "assigned_technician",
        )

        if role in ["ADMIN", "MANAGER"]:
            return queryset

        if role == "TECHNICIAN":
            return queryset.filter(assigned_technician=user)

        if role == "EMPLOYEE":
            return queryset.filter(service_request__requester=user)

        return WorkOrder.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)