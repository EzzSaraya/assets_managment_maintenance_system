from rest_framework import filters, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import MaintenanceSchedule
from .permissions import MaintenanceSchedulePermission
from .serializers import MaintenanceScheduleSerializer


class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [MaintenanceSchedulePermission]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "schedule_code",
        "title",
        "description",
        "asset__asset_code",
        "asset__name",
        "assigned_technician__username",
    ]
    ordering_fields = [
        "next_due_date",
        "last_completed_date",
        "frequency",
        "priority",
        "status",
        "created_at",
    ]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        queryset = MaintenanceSchedule.objects.select_related(
            "asset",
            "assigned_technician",
            "created_by",
        )

        if role in ["ADMIN", "MANAGER"]:
            return queryset

        if role == "TECHNICIAN":
            return queryset.filter(assigned_technician=user)

        if role == "EMPLOYEE":
            return queryset.filter(status=MaintenanceSchedule.Status.ACTIVE)

        return MaintenanceSchedule.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        role = getattr(getattr(self.request.user, "profile", None), "role", None)

        if role == "TECHNICIAN":
            allowed_fields = {
                "last_completed_date",
                "notes",
            }

            submitted_fields = set(serializer.validated_data.keys())

            if not submitted_fields.issubset(allowed_fields):
                raise PermissionDenied(
                    "Technicians can only update last completed date and notes."
                )

        serializer.save()