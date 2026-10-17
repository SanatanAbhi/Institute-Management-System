from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Attendance
from .serializers import AttendanceSerializer


class CenterAttendanceListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = AttendanceSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_center(self):

        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can access attendance."
            )

        center = getattr(user, "center", None)

        if center is None:
            raise PermissionDenied(
                "No center is associated with this account."
            )

        return center

    def get_queryset(self):

        center = self.get_center()

        return (
            Attendance.objects
            .filter(center=center)
            .select_related(
                "student",
                "batch",
                "center",
                "marked_by",
            )
            .order_by(
                "-date",
                "-created_at",
            )
        )

    @transaction.atomic
    def perform_create(self, serializer):

        center = self.get_center()

        # Lock the related student and batch rows during creation.
        # This helps keep attendance creation consistent
        # when multiple requests arrive at the same time.
        student = serializer.validated_data["student"]
        batch = serializer.validated_data["batch"]

        student.__class__.objects.select_for_update().get(
            pk=student.pk
        )

        batch.__class__.objects.select_for_update().get(
            pk=batch.pk
        )

        # Re-check that the selected objects still belong
        # to the logged-in center before saving.
        if student.center_id != center.id:
            raise PermissionDenied(
                "Selected student does not belong to your center."
            )

        if batch.center_id != center.id:
            raise PermissionDenied(
                "Selected batch does not belong to your center."
            )

        serializer.save(
            center=center,
            marked_by=self.request.user,
        )


class CenterAttendanceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = AttendanceSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_center(self):

        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can manage attendance."
            )

        center = getattr(user, "center", None)

        if center is None:
            raise PermissionDenied(
                "No center is associated with this account."
            )

        return center

    def get_queryset(self):

        center = self.get_center()

        return (
            Attendance.objects
            .filter(center=center)
            .select_related(
                "student",
                "batch",
                "center",
                "marked_by",
            )
        )

    @transaction.atomic
    def perform_update(self, serializer):

        center = self.get_center()

        student = serializer.validated_data.get(
            "student",
            serializer.instance.student,
        )

        batch = serializer.validated_data.get(
            "batch",
            serializer.instance.batch,
        )

        # Lock related rows during update.
        student.__class__.objects.select_for_update().get(
            pk=student.pk
        )

        batch.__class__.objects.select_for_update().get(
            pk=batch.pk
        )

        if student.center_id != center.id:
            raise PermissionDenied(
                "Selected student does not belong to your center."
            )

        if batch.center_id != center.id:
            raise PermissionDenied(
                "Selected batch does not belong to your center."
            )

        serializer.save(
            center=center,
            marked_by=self.request.user,
        )