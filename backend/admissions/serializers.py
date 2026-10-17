from rest_framework import serializers

from .models import Admission
from students.models import Student
from courses.models import Course
from batches.models import Batch


class AdmissionSerializer(serializers.ModelSerializer):

    # ----------------------------------------------------------
    # Read-only display fields
    # ----------------------------------------------------------

    student_name = serializers.SerializerMethodField()

    registration_number = serializers.CharField(
        source="student.registration_number",
        read_only=True
    )

    course_name = serializers.CharField(
        source="course.course_name",
        read_only=True
    )

    course_code = serializers.CharField(
        source="course.course_code",
        read_only=True
    )

    batch_name = serializers.CharField(
        source="batch.batch_name",
        read_only=True
    )

    batch_code = serializers.CharField(
        source="batch.batch_code",
        read_only=True
    )

    center_name = serializers.CharField(
        source="center.center_name",
        read_only=True
    )

    def get_student_name(self, obj):
        return (
            f"{obj.student.first_name} "
            f"{obj.student.last_name}"
        ).strip()

    class Meta:

        model = Admission

        fields = [
            "id",
            "admission_number",

            "student",
            "student_name",
            "registration_number",

            "center",
            "center_name",

            "course",
            "course_name",
            "course_code",

            "batch",
            "batch_name",
            "batch_code",

            "admission_date",
            "status",

            "course_fee",
            "discount",
            "final_fee",
            "paid_amount",
            "pending_amount",
            "payment_status",

            "remarks",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "admission_number",
            "center",
            "center_name",
            "student_name",
            "registration_number",
            "course_name",
            "course_code",
            "batch_name",
            "batch_code",
            "final_fee",
            "pending_amount",
            "payment_status",
            "created_at",
            "updated_at",
        ]


class AdmissionCreateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Admission

        fields = [
            "student",
            "course",
            "batch",
            "admission_date",
            "status",
            "course_fee",
            "discount",
            "paid_amount",
            "remarks",
        ]

    def validate(self, attrs):

        request = self.context["request"]

        center = getattr(
            request.user,
            "center",
            None
        )

        if center is None:
            raise serializers.ValidationError(
                "Center profile not found for this user."
            )

        student = attrs.get("student")
        course = attrs.get("course")
        batch = attrs.get("batch")

        # ------------------------------------------------------
        # Student must belong to logged-in center
        # ------------------------------------------------------

        if student.center_id != center.id:
            raise serializers.ValidationError({
                "student": (
                    "Selected student does not belong "
                    "to your center."
                )
            })

        # ------------------------------------------------------
        # Course must match student's course
        # ------------------------------------------------------

        if student.course_id != course.id:
            raise serializers.ValidationError({
                "course": (
                    "Selected course does not match "
                    "the student's course."
                )
            })

        # ------------------------------------------------------
        # Batch must belong to center
        # ------------------------------------------------------

        if batch.center_id != center.id:
            raise serializers.ValidationError({
                "batch": (
                    "Selected batch does not belong "
                    "to your center."
                )
            })

        # ------------------------------------------------------
        # Batch must belong to selected course
        # ------------------------------------------------------

        if batch.course_id != course.id:
            raise serializers.ValidationError({
                "batch": (
                    "Selected batch does not belong "
                    "to the selected course."
                )
            })

        # ------------------------------------------------------
        # Prevent duplicate active admission
        # ------------------------------------------------------

        existing_admission = Admission.objects.filter(
            student=student,
            status__in=[
                "PENDING",
                "CONFIRMED",
            ]
        ).exists()

        if existing_admission:
            raise serializers.ValidationError({
                "student": (
                    "This student already has an active admission."
                )
            })

        # ------------------------------------------------------
        # Course fee validation
        # ------------------------------------------------------

        course_fee = attrs.get("course_fee", 0)
        discount = attrs.get("discount", 0)
        paid_amount = attrs.get("paid_amount", 0)

        if course_fee < 0:
            raise serializers.ValidationError({
                "course_fee": "Course fee cannot be negative."
            })

        if discount < 0:
            raise serializers.ValidationError({
                "discount": "Discount cannot be negative."
            })

        if paid_amount < 0:
            raise serializers.ValidationError({
                "paid_amount": "Paid amount cannot be negative."
            })

        final_fee = course_fee - discount

        if discount > course_fee:
            raise serializers.ValidationError({
                "discount": (
                    "Discount cannot be greater "
                    "than course fee."
                )
            })

        if paid_amount > final_fee:
            raise serializers.ValidationError({
                "paid_amount": (
                    "Paid amount cannot be greater "
                    "than final fee."
                )
            })

        return attrs

    def create(self, validated_data):

        request = self.context["request"]

        center = request.user.center

        return Admission.objects.create(
            center=center,
            **validated_data
        )


class AdmissionUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Admission

        fields = [
            "course",
            "batch",
            "admission_date",
            "status",
            "course_fee",
            "discount",
            "paid_amount",
            "remarks",
        ]

    def validate(self, attrs):

        admission = self.instance

        request = self.context["request"]

        center = getattr(
            request.user,
            "center",
            None
        )

        if center is None:
            raise serializers.ValidationError(
                "Center profile not found for this user."
            )

        # ------------------------------------------------------
        # Security check
        # ------------------------------------------------------

        if admission.center_id != center.id:
            raise serializers.ValidationError(
                "You cannot update this admission."
            )

        course = attrs.get(
            "course",
            admission.course
        )

        batch = attrs.get(
            "batch",
            admission.batch
        )

        # ------------------------------------------------------
        # Batch center validation
        # ------------------------------------------------------

        if batch.center_id != center.id:
            raise serializers.ValidationError({
                "batch": (
                    "Selected batch does not belong "
                    "to your center."
                )
            })

        # ------------------------------------------------------
        # Batch course validation
        # ------------------------------------------------------

        if batch.course_id != course.id:
            raise serializers.ValidationError({
                "batch": (
                    "Selected batch does not belong "
                    "to the selected course."
                )
            })

        # ------------------------------------------------------
        # Student course validation
        # ------------------------------------------------------

        if admission.student.course_id != course.id:
            raise serializers.ValidationError({
                "course": (
                    "Selected course does not match "
                    "the student's course."
                )
            })

        # ------------------------------------------------------
        # Fee validation
        # ------------------------------------------------------

        course_fee = attrs.get(
            "course_fee",
            admission.course_fee
        )

        discount = attrs.get(
            "discount",
            admission.discount
        )

        paid_amount = attrs.get(
            "paid_amount",
            admission.paid_amount
        )

        if discount < 0:
            raise serializers.ValidationError({
                "discount": "Discount cannot be negative."
            })

        if paid_amount < 0:
            raise serializers.ValidationError({
                "paid_amount": "Paid amount cannot be negative."
            })

        if discount > course_fee:
            raise serializers.ValidationError({
                "discount": (
                    "Discount cannot be greater "
                    "than course fee."
                )
            })

        final_fee = course_fee - discount

        if paid_amount > final_fee:
            raise serializers.ValidationError({
                "paid_amount": (
                    "Paid amount cannot be greater "
                    "than final fee."
                )
            })

        return attrs