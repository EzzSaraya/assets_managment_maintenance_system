from rest_framework.permissions import SAFE_METHODS, BasePermission


class ServiceRequestPermission(BasePermission):
    """
    Admin and Manager can view and update all service requests.
    Employee can create requests and view own requests.
    Technician can view assigned requests.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        role = getattr(getattr(user, "profile", None), "role", None)

        if request.method == "POST":
            return role in ["ADMIN", "MANAGER", "EMPLOYEE"]

        if request.method in SAFE_METHODS:
            return role in ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]

        return role in ["ADMIN", "MANAGER"]

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = getattr(getattr(user, "profile", None), "role", None)

        if role in ["ADMIN", "MANAGER"]:
            return True

        if request.method in SAFE_METHODS:
            if role == "EMPLOYEE":
                return obj.requester == user

            if role == "TECHNICIAN":
                return obj.assigned_technician == user

        return False