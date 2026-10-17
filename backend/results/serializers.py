from rest_framework import serializers

from .models import Result


class ResultSerializer(serializers.ModelSerializer):

    center_name = serializers.SerializerMethodField()
    exam_title = serializers.SerializerMethodField()
    exam_type = serializers.SerializerMethodField()
    exam_date = serializers.SerializerMethodField()
    max_marks = serializers.SerializerMethodField()
    pass_marks = serializers.SerializerMethodField()
    batch_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_registration_number = serializers.SerializerMethodField()
    entered_by_name = serializers.SerializerMethodField()

    class Meta:

        model = Result

        fields = [
            "id",
            "center",
            "center_name",
            "exam",
            "exam_title",
            "exam_type",
            "exam_date",
            "batch_name",
            "course_name",
            "student",
            "student_name",
            "student_registration_number",
            "marks_obtained",
            "max_marks",
            "pass_marks",
            "percentage",
            "grade",
            "attendance_status",
            "result_status",
            "remarks",
            "entered_by",
            "entered_by_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "center",
            "center_name",
            "exam_title",
            "exam_type",
            "exam_date",
            "batch_name",
            "course_name",
            "student_name",
            "student_registration_number",
            "max_marks",
            "pass_marks",
            "percentage",
            "grade",
            "result_status",
            "entered_by",
            "entered_by_name",
            "created_at",
            "updated_at",
        ]

    def get_center_name(self, obj):

        return str(obj.center)

    def get_exam_title(self, obj):

        return obj.exam.title

    def get_exam_type(self, obj):

        return obj.exam.get_exam_type_display()

    def get_exam_date(self, obj):

        return obj.exam.exam_date

    def get_max_marks(self, obj):

        return obj.exam.max_marks

    def get_pass_marks(self, obj):

        return obj.exam.pass_marks

    def get_batch_name(self, obj):

        return str(obj.exam.batch)

    def get_course_name(self, obj):

        course = getattr(
            obj.exam.batch,
            "course",
            None,
        )

        if course is None:
            return None

        return getattr(
            course,
            "course_name",
            str(course),
        )

    def get_student_name(self, obj):

        student = obj.student

        full_name = (
            f"{student.first_name} "
            f"{student.last_name}"
        ).strip()

        return full_name or str(student)

    def get_student_registration_number(self, obj):

        return getattr(
            obj.student,
            "registration_number",
            None,
        )

    def get_entered_by_name(self, obj):

        if not obj.entered_by:
            return None

        full_name = (
            f"{obj.entered_by.first_name} "
            f"{obj.entered_by.last_name}"
        ).strip()

        return (
            full_name
            or obj.entered_by.username
        )

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
                "Only Center users can manage results."
            )

        center = getattr(
            user,
            "center",
            None,
        )

        if center is None:
            raise serializers.ValidationError(
                "No center is associated with this account."
            )

        exam = attrs.get(
            "exam",
            getattr(
                self.instance,
                "exam",
                None,
            ),
        )

        student = attrs.get(
            "student",
            getattr(
                self.instance,
                "student",
                None,
            ),
        )

        marks_obtained = attrs.get(
            "marks_obtained",
            getattr(
                self.instance,
                "marks_obtained",
                None,
            ),
        )

        attendance_status = attrs.get(
            "attendance_status",
            getattr(
                self.instance,
                "attendance_status",
                Result.PRESENT,
            ),
        )

        if exam is None:
            raise serializers.ValidationError(
                {
                    "exam": (
                        "An exam must be selected."
                    )
                }
            )

        if student is None:
            raise serializers.ValidationError(
                {
                    "student": (
                        "A student must be selected."
                    )
                }
            )

        if exam.center_id != center.id:
            raise serializers.ValidationError(
                {
                    "exam": (
                        "Selected exam does not belong "
                        "to your center."
                    )
                }
            )

        if student.center_id != center.id:
            raise serializers.ValidationError(
                {
                    "student": (
                        "Selected student does not belong "
                        "to your center."
                    )
                }
            )

        # Student must belong to the exam batch.
        student_batch_id = getattr(
            student,
            "batch_id",
            None,
        )

        exam_batch_id = exam.batch_id

        if (
            student_batch_id is not None
            and student_batch_id != exam_batch_id
        ):
            raise serializers.ValidationError(
                {
                    "student": (
                        "Selected student does not belong "
                        "to the exam batch."
                    )
                }
            )

        # Marks validation.
        if marks_obtained is None:
            raise serializers.ValidationError(
                {
                    "marks_obtained": (
                        "Marks obtained are required."
                    )
                }
            )

        if marks_obtained < 0:
            raise serializers.ValidationError(
                {
                    "marks_obtained": (
                        "Marks obtained cannot be negative."
                    )
                }
            )

        if marks_obtained > exam.max_marks:
            raise serializers.ValidationError(
                {
                    "marks_obtained": (
                        "Marks obtained cannot be greater "
                        "than the maximum marks."
                    )
                }
            )

        # Absent student must receive zero marks.
        if (
            attendance_status == Result.ABSENT
            and marks_obtained != 0
        ):
            raise serializers.ValidationError(
                {
                    "marks_obtained": (
                        "Absent students must have zero marks."
                    )
                }
            )

        # Prevent duplicate result for same exam/student.
        duplicate_query = Result.objects.filter(
            exam=exam,
            student=student,
        )

        if self.instance:
            duplicate_query = duplicate_query.exclude(
                pk=self.instance.pk
            )

        if duplicate_query.exists():
            raise serializers.ValidationError(
                {
                    "student": (
                        "A result already exists for this "
                        "student in the selected exam."
                    )
                }
            )

        return attrs