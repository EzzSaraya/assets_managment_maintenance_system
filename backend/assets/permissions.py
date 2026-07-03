from rest_framework.permissions import SAFE_METHODS, BasePermission


class AssetPermission(BasePermission):
    """
    Admin can create, update, delete, and view assets.
    Manager, Technician, and Employee can view assets only.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        role = getattr(getattr(user, "profile", None), "role", None)

        if request.method in SAFE_METHODS:
            return role in ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]

        return role == "ADMIN"