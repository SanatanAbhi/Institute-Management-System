from rest_framework.permissions import BasePermission

class IsCenterOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.center.user == request.user