from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from .models import Admission
from .serializers import (
    AdmissionSerializer,
    AdmissionCreateSerializer,
    AdmissionUpdateSerializer,
)
from students.permissions import IsCenterOwner


class CenterAdmissionListCreateAPIView(ListCreateAPIView):
    """
    List all admissions belonging to the logged-in center
    and create a new admission.
    """

    permission_classes = [
        IsAuthenticated,
        IsCenterOwner,
    ]

    def get_queryset(self):

        center = self.request.user.center

        queryset = (
            Admission.objects
            .filter(center=center)
            .select_related(
                "student",
                "center",
                "course",
                "batch",
            )
            .order_by("-created_at")
        )

        # ------------------------------------------------------
        # Search
        # ------------------------------------------------------

        search = self.request.query_params.get(
            "search"
        )

        if search:

            queryset = queryset.filter(
                student__first_name__icontains=search
            ) | queryset.filter(
                student__last_name__icontains=search
            ) | queryset.filter(
                student__registration_number__icontains=search
            ) | queryset.filter(
                admission_number__icontains=search
            ) | queryset.filter(
                course__course_name__icontains=search
            ) | queryset.filter(
                batch__batch_name__icontains=search
            )

        # ------------------------------------------------------
        # Status filter
        # ------------------------------------------------------

        status = self.request.query_params.get(
            "status"
        )

        if status:
            queryset = queryset.filter(
                status=status
            )

        # ------------------------------------------------------
        # Payment status filter
        # ------------------------------------------------------

        payment_status = self.request.query_params.get(
            "payment_status"
        )

        if payment_status:
            queryset = queryset.filter(
                payment_status=payment_status
            )

        return queryset.distinct()

    def get_serializer_class(self):

        if self.request.method == "POST":
            return AdmissionCreateSerializer

        return AdmissionSerializer


class CenterAdmissionDetailAPIView(
    RetrieveUpdateDestroyAPIView
):
    """
    View, update and delete a center's admission.
    """

    permission_classes = [
        IsAuthenticated,
        IsCenterOwner,
    ]

    def get_queryset(self):

        center = self.request.user.center

        return (
            Admission.objects
            .filter(center=center)
            .select_related(
                "student",
                "center",
                "course",
                "batch",
            )
        )

    def get_serializer_class(self):

        if self.request.method in [
            "PUT",
            "PATCH",
        ]:
            return AdmissionUpdateSerializer

        return AdmissionSerializer