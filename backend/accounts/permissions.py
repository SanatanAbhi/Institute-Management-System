from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Allow access only to authenticated, active Super Admin users.
    """

    message = "Only Super Admin users can access this resource."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and getattr(user, "role", None) == "SUPER_ADMIN"
        )