
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsSuperAdmin
from centers.models import Center
from .models import Batch
from .serializers import BatchSerializer


class BatchListAPIView(ListCreateAPIView):
    serializer_class = BatchSerializer

    def get_queryset(self):
        queryset = (
            Batch.objects.select_related("center", "course")
            .all()
            .order_by("start_date")
        )

        user = self.request.user
        role = getattr(user, "role", None) if user.is_authenticated else None

        if role == "CENTER":
            try:
                center = user.center
            except Center.DoesNotExist:
                return queryset.none()

            queryset = queryset.filter(
                center=center,
                status__in=["UPCOMING", "ACTIVE"],
            )

        elif role != "SUPER_ADMIN":
            queryset = queryset.filter(
                status__in=["UPCOMING", "ACTIVE"],
            )

        # Query parameters may narrow results but cannot bypass
        # the Center user's own-center restriction.
        center_id = self.request.query_params.get("center")
        course_id = self.request.query_params.get("course")

        if center_id:
            queryset = queryset.filter(center_id=center_id)

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsSuperAdmin()]


class BatchDetailAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = BatchSerializer
    queryset = Batch.objects.select_related("center", "course").all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]
