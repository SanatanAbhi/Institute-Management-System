from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from .models import Fee
from .serializers import (
    CenterFeeSerializer,
    CenterFeeCreateUpdateSerializer,
)


class CenterFeeListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Fee.objects.none()

        if user.role != "CENTER":
            return Fee.objects.none()

        try:
            center = user.center
        except AttributeError:
            return Fee.objects.none()

        return (
            Fee.objects.filter(center=center)
            .select_related(
                "student",
                "student__user",
                "center",
                "admission",
                "admission__course",
                "admission__batch",
            )
            .order_by("-payment_date", "-created_at")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CenterFeeCreateUpdateSerializer

        return CenterFeeSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.role != "CENTER":
            return Response(
                {"detail": "Only center users can create fee payments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            center = user.center
        except AttributeError:
            return Response(
                {"detail": "Your account is not linked to a center."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        admission = serializer.validated_data["admission"]

        locked_admission = (
            admission.__class__.objects
            .select_for_update()
            .select_related("student", "center", "course", "batch")
            .get(pk=admission.pk)
        )

        serializer.validated_data["admission"] = locked_admission

        fee = serializer.save(
            center=center,
            student=locked_admission.student,
        )

        response_serializer = CenterFeeSerializer(
            fee,
            context={"request": request},
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class CenterFeeDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Fee.objects.none()

        if user.role != "CENTER":
            return Fee.objects.none()

        try:
            center = user.center
        except AttributeError:
            return Fee.objects.none()

        return (
            Fee.objects.filter(center=center)
            .select_related(
                "student",
                "student__user",
                "center",
                "admission",
                "admission__course",
                "admission__batch",
            )
        )

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CenterFeeCreateUpdateSerializer

        return CenterFeeSerializer

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        locked_instance = (
            Fee.objects
            .select_for_update()
            .select_related(
                "student",
                "center",
                "admission",
            )
            .get(pk=instance.pk)
        )

        serializer = self.get_serializer(
            locked_instance,
            data=request.data,
            partial=request.method == "PATCH",
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        updated_fee = serializer.save()

        response_serializer = CenterFeeSerializer(
            updated_fee,
            context={"request": request},
        )

        return Response(response_serializer.data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        instance.delete()

        return Response(
            {"detail": "Fee payment deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )