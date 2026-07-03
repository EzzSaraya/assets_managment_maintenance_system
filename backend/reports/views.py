from django.db.models import Sum
from rest_framework import filters, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from assets.models import Asset
from maintenance.models import MaintenanceSchedule
from service_requests.models import ServiceRequest
from work_orders.models import WorkOrder

from .models import MaintenanceHistory
from .permissions import MaintenanceHistoryPermission
from .serializers import MaintenanceHistorySerializer


class MaintenanceHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceHistorySerializer
    permission_classes = [MaintenanceHistoryPermission]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "history_code",
        "title",
        "description",
        "asset__asset_code",
        "asset__name",
        "performed_by__username",
    ]
    ordering_fields = [
        "completion_date",
        "cost",
        "downtime_hours",
        "maintenance_type",
        "created_at",
    ]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        queryset = MaintenanceHistory.objects.select_related(
            "asset",
            "work_order",
            "work_order__service_request",
            "maintenance_schedule",
            "performed_by",
        )

        if role in ["ADMIN", "MANAGER"]:
            return queryset

        if role == "TECHNICIAN":
            return queryset.filter(performed_by=user)

        if role == "EMPLOYEE":
            return queryset.filter(work_order__service_request__requester=user)

        return MaintenanceHistory.objects.none()

    def perform_create(self, serializer):
        if serializer.validated_data.get("performed_by"):
            serializer.save()
        else:
            serializer.save(performed_by=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reports_summary(request):
    role = getattr(getattr(request.user, "profile", None), "role", None)

    if role not in ["ADMIN", "MANAGER"]:
        return Response(
            {"detail": "Only admin and manager users can view reports summary."},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_cost = MaintenanceHistory.objects.aggregate(
        total=Sum("cost")
    )["total"] or 0

    total_downtime = MaintenanceHistory.objects.aggregate(
        total=Sum("downtime_hours")
    )["total"] or 0

    data = {
        "assets": {
            "total": Asset.objects.count(),
            "active": Asset.objects.filter(status="ACTIVE").count(),
            "under_maintenance": Asset.objects.filter(
                status="UNDER_MAINTENANCE"
            ).count(),
            "retired": Asset.objects.filter(status="RETIRED").count(),
        },
        "service_requests": {
            "total": ServiceRequest.objects.count(),
            "pending": ServiceRequest.objects.filter(status="PENDING").count(),
            "approved": ServiceRequest.objects.filter(status="APPROVED").count(),
            "completed": ServiceRequest.objects.filter(status="COMPLETED").count(),
        },
        "work_orders": {
            "total": WorkOrder.objects.count(),
            "open": WorkOrder.objects.filter(status="OPEN").count(),
            "assigned": WorkOrder.objects.filter(status="ASSIGNED").count(),
            "in_progress": WorkOrder.objects.filter(status="IN_PROGRESS").count(),
            "completed": WorkOrder.objects.filter(status="COMPLETED").count(),
        },
        "maintenance_schedules": {
            "total": MaintenanceSchedule.objects.count(),
            "active": MaintenanceSchedule.objects.filter(status="ACTIVE").count(),
            "inactive": MaintenanceSchedule.objects.filter(status="INACTIVE").count(),
        },
        "maintenance_history": {
            "total_records": MaintenanceHistory.objects.count(),
            "total_cost": total_cost,
            "total_downtime_hours": total_downtime,
        },
    }

    return Response(data)