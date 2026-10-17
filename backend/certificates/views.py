from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Certificate
from .serializers import CertificateSerializer


class CenterCertificateListCreateAPIView(
    generics.ListCreateAPIView
):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_center(self):
        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can access certificates."
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
            Certificate.objects
            .filter(center=center)
            .select_related(
                "center",
                "student",
                "course",
                "result",
                "result__exam",
                "result__exam__batch",
                "issued_by",
            )
            .order_by("-created_at")
        )

    @transaction.atomic
    def perform_create(self, serializer):
        center = self.get_center()

        student = serializer.validated_data["student"]
        course = serializer.validated_data["course"]
        result = serializer.validated_data["result"]

        # Lock related records during validation and creation.
        student = student.__class__.objects.select_for_update().get(
            pk=student.pk
        )

        result = result.__class__.objects.select_for_update().get(
            pk=result.pk
        )

        if student.center_id != center.id:
            raise PermissionDenied(
                "Selected student does not belong to your center."
            )

        if result.center_id != center.id:
            raise PermissionDenied(
                "Selected result does not belong to your center."
            )

        if result.student_id != student.id:
            raise PermissionDenied(
                "Selected result does not belong to this student."
            )

        if result.result_status != "PASS":
            raise PermissionDenied(
                "A certificate can only be created for a passing result."
            )

        if result.exam.batch.course_id != course.id:
            raise PermissionDenied(
                "Selected course does not match the exam result."
            )

        serializer.save(
            center=center,
            issued_by=self.request.user,
        )


class CenterCertificateDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_center(self):
        user = self.request.user

        if getattr(user, "role", None) != "CENTER":
            raise PermissionDenied(
                "Only Center users can manage certificates."
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
            Certificate.objects
            .filter(center=center)
            .select_related(
                "center",
                "student",
                "course",
                "result",
                "result__exam",
                "result__exam__batch",
                "issued_by",
            )
        )

    @transaction.atomic
    def perform_update(self, serializer):
        center = self.get_center()

        student = serializer.validated_data.get(
            "student",
            serializer.instance.student,
        )

        course = serializer.validated_data.get(
            "course",
            serializer.instance.course,
        )

        result = serializer.validated_data.get(
            "result",
            serializer.instance.result,
        )

        student = student.__class__.objects.select_for_update().get(
            pk=student.pk
        )

        result = result.__class__.objects.select_for_update().get(
            pk=result.pk
        )

        if student.center_id != center.id:
            raise PermissionDenied(
                "Selected student does not belong to your center."
            )

        if result.center_id != center.id:
            raise PermissionDenied(
                "Selected result does not belong to your center."
            )

        if result.student_id != student.id:
            raise PermissionDenied(
                "Selected result does not belong to this student."
            )

        if result.result_status != "PASS":
            raise PermissionDenied(
                "A certificate requires a passing result."
            )

        if result.exam.batch.course_id != course.id:
            raise PermissionDenied(
                "Selected course does not match the exam result."
            )

        serializer.save(
            center=center,
            issued_by=self.request.user,
        )