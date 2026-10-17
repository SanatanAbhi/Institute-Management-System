from django.apps import apps
from django.contrib.auth import get_user_model

from rest_framework import filters, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsSuperAdmin
from .serializers import SuperAdminUserSerializer


User = get_user_model()


def count_model_records(app_label, model_names):
    """
    Count records in the first matching model.

    Supporting multiple model names makes the dashboard tolerant
    of common naming variations across IMS apps.
    """
    for model_name in model_names:
        try:
            model = apps.get_model(app_label, model_name)
        except LookupError:
            continue

        if model is not None:
            return model._default_manager.count()

    return 0


class SuperAdminDashboardView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        metrics = {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "super_admins": User.objects.filter(
                role="SUPER_ADMIN",
                is_active=True,
            ).count(),
            "center_accounts": User.objects.filter(
                role="CENTER",
            ).count(),
            "student_accounts": User.objects.filter(
                role="STUDENT",
            ).count(),

            "total_centers": count_model_records(
                "centers",
                ["Center", "TrainingCenter", "Franchise"],
            ),
            "total_students": count_model_records(
                "students",
                ["Student"],
            ),
            "total_courses": count_model_records(
                "courses",
                ["Course"],
            ),
            "total_batches": count_model_records(
                "batches",
                ["Batch"],
            ),
            "total_admissions": count_model_records(
                "admissions",
                ["Admission"],
            ),
            "total_fee_records": count_model_records(
                "fees",
                ["Fee", "FeePayment", "FeeCollection", "FeeRecord"],
            ),
            "total_attendance_records": count_model_records(
                "attendance",
                ["Attendance"],
            ),
            "total_exams": count_model_records(
                "exams",
                ["Exam"],
            ),
            "total_results": count_model_records(
                "results",
                ["Result"],
            ),
            "total_certificates": count_model_records(
                "certificates",
                ["Certificate"],
            ),
            "total_applications": count_model_records(
                "applications",
                ["Application"],
            ),
        }

        recent_users = User.objects.order_by(
            "-date_joined"
        ).values(
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_active",
            "date_joined",
        )[:6]

        return Response({
            "metrics": metrics,
            "recent_users": [
                {
                    **user,
                    "date_joined": (
                        user["date_joined"].isoformat()
                        if user["date_joined"]
                        else None
                    ),
                }
                for user in recent_users
            ],
        })


class SuperAdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = SuperAdminUserSerializer
    permission_classes = [IsSuperAdmin]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "username",
        "first_name",
        "last_name",
        "email",
    ]

    ordering_fields = [
        "username",
        "date_joined",
        "last_login",
        "role",
    ]

    ordering = ["-date_joined"]

    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined")

        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)

        active_status = self.request.query_params.get("is_active")
        if active_status in ("true", "false"):
            queryset = queryset.filter(
                is_active=(active_status == "true")
            )

        return queryset

    def perform_update(self, serializer):
        existing_user = serializer.instance

        new_role = serializer.validated_data.get(
            "role",
            existing_user.role,
        )
        new_active_status = serializer.validated_data.get(
            "is_active",
            existing_user.is_active,
        )

        is_losing_last_active_admin = (
            existing_user.role == "SUPER_ADMIN"
            and existing_user.is_active
            and (
                new_role != "SUPER_ADMIN"
                or not new_active_status
            )
        )

        if is_losing_last_active_admin:
            another_active_admin_exists = User.objects.filter(
                role="SUPER_ADMIN",
                is_active=True,
            ).exclude(pk=existing_user.pk).exists()

            if not another_active_admin_exists:
                raise ValidationError({
                    "detail": (
                        "The last active Super Admin cannot be "
                        "demoted or deactivated."
                    )
                })

        serializer.save()

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError({
                "detail": "You cannot delete your own account."
            })

        if (
            instance.role == "SUPER_ADMIN"
            and instance.is_active
        ):
            another_active_admin_exists = User.objects.filter(
                role="SUPER_ADMIN",
                is_active=True,
            ).exclude(pk=instance.pk).exists()

            if not another_active_admin_exists:
                raise ValidationError({
                    "detail": (
                        "The last active Super Admin cannot be deleted."
                    )
                })

        instance.delete()