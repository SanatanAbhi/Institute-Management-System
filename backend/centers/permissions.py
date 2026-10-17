
from rest_framework.permissions import BasePermission


class IsCenterOwner(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and
            request.user.role == "CENTER"
        )

class IsSuperAdmin(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and
            request.user.role == "SUPER_ADMIN"
        )