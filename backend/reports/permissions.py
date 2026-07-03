from rest_framework.permissions import SAFE_METHODS, BasePermission


class MaintenanceHistoryPermission(BasePermission):
    """
    Admin and Manager can create, update, delete, and view all history records.
    Technician can create and view records related to their work.
    Employee can view history related to their own service requests.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        role = getattr(getattr(user, "profile", None), "role", None)

        if request.method in SAFE_METHODS:
            return role in ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]

        if request.method == "POST":
            return role in ["ADMIN", "MANAGER", "TECHNICIAN"]

        return role in ["ADMIN", "MANAGER"]

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        if role in ["ADMIN", "MANAGER"]:
            return True

        if role == "TECHNICIAN":
            return (
                obj.performed_by == user
                or (
                    obj.work_order is not None
                    and obj.work_order.assigned_technician == user
                )
                or (
                    obj.maintenance_schedule is not None
                    and obj.maintenance_schedule.assigned_technician == user
                )
            )

        if role == "EMPLOYEE" and request.method in SAFE_METHODS:
            return (
                obj.work_order is not None
                and obj.work_order.service_request is not None
                and obj.work_order.service_request.requester == user
            )

        return False