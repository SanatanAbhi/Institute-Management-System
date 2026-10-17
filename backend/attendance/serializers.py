from rest_framework import serializers

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):

    student_name = serializers.SerializerMethodField()
    student_registration_number = serializers.SerializerMethodField()
    batch_name = serializers.SerializerMethodField()
    center_name = serializers.SerializerMethodField()
    marked_by_name = serializers.SerializerMethodField()

    class Meta:

        model = Attendance

        fields = [
            "id",
            "center",
            "center_name",
            "student",
            "student_name",
            "student_registration_number",
            "batch",
            "batch_name",
            "date",
            "status",
            "remarks",
            "marked_by",
            "marked_by_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "center",
            "center_name",
            "student_name",
            "student_registration_number",
            "batch_name",
            "marked_by",
            "marked_by_name",
            "created_at",
            "updated_at",
        ]

    # ==========================================
    # Display Helpers
    # ==========================================

    def get_student_name(self, obj):
        student = obj.student

        full_name = (
            f"{student.first_name} {student.last_name}"
        ).strip()

        return full_name or str(student)

    def get_student_registration_number(self, obj):
        return getattr(
            obj.student,
            "registration_number",
            None,
        )

    def get_batch_name(self, obj):
        return getattr(
            obj.batch,
            "batch_name",
            str(obj.batch),
        )

    def get_center_name(self, obj):
        return str(obj.center)

    def get_marked_by_name(self, obj):

        if not obj.marked_by:
            return None

        full_name = (
            f"{obj.marked_by.first_name} "
            f"{obj.marked_by.last_name}"
        ).strip()

        return full_name or obj.marked_by.username

    # ==========================================
    # Validation
    # ==========================================

    def validate(self, attrs):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        if getattr(user, "role", None) != "CENTER":
            raise serializers.ValidationError(
                "Only Center users can manage attendance."
            )

        center = getattr(user, "center", None)

        if center is None:
            raise serializers.ValidationError(
                "No center is associated with this account."
            )

        student = attrs.get(
            "student",
            getattr(self.instance, "student", None),
        )

        batch = attrs.get(
            "batch",
            getattr(self.instance, "batch", None),
        )

        date = attrs.get(
            "date",
            getattr(self.instance, "date", None),
        )

        # ------------------------------------------
        # Student must belong to logged-in center
        # ------------------------------------------

        if student and student.center_id != center.id:
            raise serializers.ValidationError(
                {
                    "student": (
                        "Selected student does not belong "
                        "to your center."
                    )
                }
            )

        # ------------------------------------------
        # Batch must belong to logged-in center
        # ------------------------------------------

        if batch and batch.center_id != center.id:
            raise serializers.ValidationError(
                {
                    "batch": (
                        "Selected batch does not belong "
                        "to your center."
                    )
                }
            )

        # ------------------------------------------
        # Student and batch must match
        # ------------------------------------------

        if student and batch:

            student_batch_id = getattr(
                student,
                "batch_id",
                None,
            )

            if (
                student_batch_id is not None
                and student_batch_id != batch.id
            ):
                raise serializers.ValidationError(
                    {
                        "batch": (
                            "Selected batch is not assigned "
                            "to this student."
                        )
                    }
                )

        # ------------------------------------------
        # Attendance date cannot be in future
        # ------------------------------------------

        from django.utils import timezone

        if date and date > timezone.localdate():
            raise serializers.ValidationError(
                {
                    "date": (
                        "Attendance date cannot be "
                        "in the future."
                    )
                }
            )

        # ------------------------------------------
        # Prevent duplicate attendance
        # ------------------------------------------

        if student and date:

            duplicate_query = Attendance.objects.filter(
                student=student,
                date=date,
            )

            if self.instance:
                duplicate_query = duplicate_query.exclude(
                    pk=self.instance.pk
                )

            if duplicate_query.exists():
                raise serializers.ValidationError(
                    {
                        "date": (
                            "Attendance has already been "
                            "marked for this student on "
                            "this date."
                        )
                    }
                )

        return attrs