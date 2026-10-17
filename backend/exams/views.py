from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Exam
from .serializers import ExamSerializer


class CenterExamListCreateAPIView(generics.ListCreateAPIView):

    serializer_class = ExamSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_center(self):

        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can access exams."
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
            Exam.objects
            .filter(center=center)
            .select_related(
                "center",
                "batch",
                "created_by",
            )
            .order_by(
                "-exam_date",
                "-start_time",
                "-created_at",
            )
        )

    @transaction.atomic
    def perform_create(self, serializer):

        center = self.get_center()

        batch = serializer.validated_data["batch"]

        batch.__class__.objects.select_for_update().get(
            pk=batch.pk
        )

        if batch.center_id != center.id:
            raise PermissionDenied(
                "Selected batch does not belong to your center."
            )

        serializer.save(
            center=center,
            created_by=self.request.user,
        )


class CenterExamDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ExamSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_center(self):

        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can manage exams."
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
            Exam.objects
            .filter(center=center)
            .select_related(
                "center",
                "batch",
                "created_by",
            )
        )

    @transaction.atomic
    def perform_update(self, serializer):

        center = self.get_center()

        batch = serializer.validated_data.get(
            "batch",
            serializer.instance.batch,
        )

        batch.__class__.objects.select_for_update().get(
            pk=batch.pk
        )

        if batch.center_id != center.id:
            raise PermissionDenied(
                "Selected batch does not belong to your center."
            )

        serializer.save(
            center=center,
            created_by=self.request.user,
        )