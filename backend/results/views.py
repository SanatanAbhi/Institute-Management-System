from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Result
from .serializers import ResultSerializer


class CenterResultListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = ResultSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_center(self):

        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can access results."
            )

        center = getattr(
            user,
            "center",
            None,
        )

        if center is None:
            raise PermissionDenied(
                "No center is associated with this account."
            )

        return center

    def get_queryset(self):

        center = self.get_center()

        return (
            Result.objects
            .filter(center=center)
            .select_related(
                "center",
                "exam",
                "exam__batch",
                "exam__batch__course",
                "student",
                "entered_by",
            )
            .order_by(
                "-exam__exam_date",
                "student__first_name",
                "student__last_name",
            )
        )

    @transaction.atomic
    def perform_create(self, serializer):

        center = self.get_center()

        exam = serializer.validated_data["exam"]
        student = serializer.validated_data["student"]

        exam.__class__.objects.select_for_update().get(
            pk=exam.pk
        )

        student.__class__.objects.select_for_update().get(
            pk=student.pk
        )

        if exam.center_id != center.id:
            raise PermissionDenied(
                "Selected exam does not belong to your center."
            )

        if student.center_id != center.id:
            raise PermissionDenied(
                "Selected student does not belong to your center."
            )

        if student.batch_id is not None:
            if student.batch_id != exam.batch_id:
                raise PermissionDenied(
                    "Selected student does not belong "
                    "to the exam batch."
                )

        serializer.save(
            center=center,
            entered_by=self.request.user,
        )


class CenterResultDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ResultSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_center(self):

        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can manage results."
            )

        center = getattr(
            user,
            "center",
            None,
        )

        if center is None:
            raise PermissionDenied(
                "No center is associated with this account."
            )

        return center

    def get_queryset(self):

        center = self.get_center()

        return (
            Result.objects
            .filter(center=center)
            .select_related(
                "center",
                "exam",
                "exam__batch",
                "exam__batch__course",
                "student",
                "entered_by",
            )
        )

    @transaction.atomic
    def perform_update(self, serializer):

        center = self.get_center()

        exam = serializer.validated_data.get(
            "exam",
            serializer.instance.exam,
        )

        student = serializer.validated_data.get(
            "student",
            serializer.instance.student,
        )

        exam.__class__.objects.select_for_update().get(
            pk=exam.pk
        )

        student.__class__.objects.select_for_update().get(
            pk=student.pk
        )

        if exam.center_id != center.id:
            raise PermissionDenied(
                "Selected exam does not belong to your center."
            )

        if student.center_id != center.id:
            raise PermissionDenied(
                "Selected student does not belong to your center."
            )

        if student.batch_id is not None:
            if student.batch_id != exam.batch_id:
                raise PermissionDenied(
                    "Selected student does not belong "
                    "to the exam batch."
                )

        serializer.save(
            center=center,
            entered_by=self.request.user,
        )