from rest_framework.permissions import SAFE_METHODS, BasePermission


class MaintenanceSchedulePermission(BasePermission):
    """
    Admin and Manager can create, update, delete, and view all schedules.
    Technician can view assigned schedules and update completion info.
    Employee can view active schedules only.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        role = getattr(getattr(user, "profile", None), "role", None)

        if request.method in SAFE_METHODS:
            return role in ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]

        if request.method == "POST":
            return role in ["ADMIN", "MANAGER"]

        return role in ["ADMIN", "MANAGER", "TECHNICIAN"]

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        if role in ["ADMIN", "MANAGER"]:
            return True

        if role == "TECHNICIAN":
            return obj.assigned_technician == user

        if role == "EMPLOYEE" and request.method in SAFE_METHODS:
            return obj.status == "ACTIVE"

        return False