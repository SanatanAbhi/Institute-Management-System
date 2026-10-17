from django.utils import timezone
from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):

    center_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_registration_number = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    result_status = serializers.SerializerMethodField()
    result_grade = serializers.SerializerMethodField()
    result_percentage = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()

    class Meta:

        model = Certificate

        fields = [
            "id",
            "center",
            "center_name",
            "student",
            "student_name",
            "student_registration_number",
            "course",
            "course_name",
            "result",
            "result_status",
            "result_grade",
            "result_percentage",
            "certificate_number",
            "completion_date",
            "issue_date",
            "grade",
            "percentage",
            "status",
            "remarks",
            "issued_by",
            "issued_by_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "center",
            "center_name",
            "student_name",
            "student_registration_number",
            "course_name",
            "result_status",
            "result_grade",
            "result_percentage",
            "certificate_number",
            "grade",
            "percentage",
            "issued_by",
            "issued_by_name",
            "created_at",
            "updated_at",
        ]

    def get_center_name(self, obj):
        return str(obj.center)

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

    def get_course_name(self, obj):

        return getattr(
            obj.course,
            "course_name",
            str(obj.course),
        )

    def get_result_status(self, obj):
        return obj.result.get_result_status_display()

    def get_result_grade(self, obj):
        return obj.result.grade

    def get_result_percentage(self, obj):
        return obj.result.percentage

    def get_issued_by_name(self, obj):

        if not obj.issued_by:
            return None

        full_name = (
            f"{obj.issued_by.first_name} "
            f"{obj.issued_by.last_name}"
        ).strip()

        return full_name or obj.issued_by.username

    def validate(self, attrs):

        request = self.context.get("request")

        if (
            not request
            or not request.user.is_authenticated
        ):
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        if getattr(user, "role", None) != "CENTER":
            raise serializers.ValidationError(
                "Only Center users can manage certificates."
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

        course = attrs.get(
            "course",
            getattr(self.instance, "course", None),
        )

        result = attrs.get(
            "result",
            getattr(self.instance, "result", None),
        )

        completion_date = attrs.get(
            "completion_date",
            getattr(self.instance, "completion_date", None),
        )

        issue_date = attrs.get(
            "issue_date",
            getattr(self.instance, "issue_date", None),
        )

        status = attrs.get(
            "status",
            getattr(
                self.instance,
                "status",
                Certificate.DRAFT,
            ),
        )

        if student is None:
            raise serializers.ValidationError({
                "student": "A student must be selected."
            })

        if course is None:
            raise serializers.ValidationError({
                "course": "A course must be selected."
            })

        if result is None:
            raise serializers.ValidationError({
                "result": "A passing result must be selected."
            })

        if student.center_id != center.id:
            raise serializers.ValidationError({
                "student": (
                    "Selected student does not belong "
                    "to your center."
                )
            })

        if result.center_id != center.id:
            raise serializers.ValidationError({
                "result": (
                    "Selected result does not belong "
                    "to your center."
                )
            })

        if result.student_id != student.id:
            raise serializers.ValidationError({
                "result": (
                    "Selected result does not belong "
                    "to the selected student."
                )
            })

        result_course_id = getattr(
            result.exam.batch,
            "course_id",
            None,
        )

        if result_course_id != course.id:
            raise serializers.ValidationError({
                "course": (
                    "Selected course does not match "
                    "the exam result."
                )
            })

        student_course_id = getattr(
            student,
            "course_id",
            None,
        )

        if (
            student_course_id is not None
            and student_course_id != course.id
        ):
            raise serializers.ValidationError({
                "course": (
                    "Selected course does not match "
                    "the student's course."
                )
            })

        if result.result_status != "PASS":
            raise serializers.ValidationError({
                "result": (
                    "A certificate can only be created "
                    "for a passing result."
                )
            })

        if (
            completion_date
            and completion_date > timezone.localdate()
        ):
            raise serializers.ValidationError({
                "completion_date": (
                    "Completion date cannot be in the future."
                )
            })

        if (
            issue_date
            and completion_date
            and issue_date < completion_date
        ):
            raise serializers.ValidationError({
                "issue_date": (
                    "Issue date cannot be before "
                    "the completion date."
                )
            })

        if (
            status == Certificate.ISSUED
            and issue_date
            and issue_date > timezone.localdate()
        ):
            raise serializers.ValidationError({
                "issue_date": (
                    "Issue date cannot be in the future."
                )
            })

        duplicate_query = Certificate.objects.filter(
            student=student,
            course=course,
        )

        if self.instance:
            duplicate_query = duplicate_query.exclude(
                pk=self.instance.pk
            )

        if duplicate_query.exists():
            raise serializers.ValidationError({
                "student": (
                    "A certificate already exists "
                    "for this student and course."
                )
            })

        return attrs

    def create(self, validated_data):

        request = self.context["request"]
        center = getattr(request.user, "center", None)

        if center is None:
            raise serializers.ValidationError(
                "No center is associated with this account."
            )

        # Set these values once; do not pass them twice.
        validated_data["center"] = center
        validated_data["issued_by"] = request.user

        return Certificate.objects.create(**validated_data)

    def update(self, instance, validated_data):

        request = self.context["request"]

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.center = request.user.center
        instance.issued_by = request.user

        instance.save()

        return instance