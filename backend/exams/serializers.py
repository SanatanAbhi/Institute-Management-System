from rest_framework import serializers

from .models import Exam


class ExamSerializer(serializers.ModelSerializer):

    center_name = serializers.SerializerMethodField()
    batch_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:

        model = Exam

        fields = [
            "id",
            "center",
            "center_name",
            "batch",
            "batch_name",
            "course_name",
            "created_by",
            "created_by_name",
            "title",
            "exam_type",
            "exam_date",
            "start_time",
            "duration_minutes",
            "max_marks",
            "pass_marks",
            "room",
            "instructions",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "center",
            "center_name",
            "batch_name",
            "course_name",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

    def get_center_name(self, obj):

        return str(obj.center)

    def get_batch_name(self, obj):

        return str(obj.batch)

    def get_course_name(self, obj):

        course = getattr(obj.batch, "course", None)

        if course is None:
            return None

        return getattr(
            course,
            "course_name",
            str(course),
        )

    def get_created_by_name(self, obj):

        if not obj.created_by:
            return None

        full_name = (
            f"{obj.created_by.first_name} "
            f"{obj.created_by.last_name}"
        ).strip()

        return full_name or obj.created_by.username

    def validate(self, attrs):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        if getattr(user, "role", None) != "CENTER":
            raise serializers.ValidationError(
                "Only Center users can manage exams."
            )

        center = getattr(user, "center", None)

        if center is None:
            raise serializers.ValidationError(
                "No center is associated with this account."
            )

        batch = attrs.get(
            "batch",
            getattr(self.instance, "batch", None),
        )

        exam_date = attrs.get(
            "exam_date",
            getattr(self.instance, "exam_date", None),
        )

        duration_minutes = attrs.get(
            "duration_minutes",
            getattr(self.instance, "duration_minutes", None),
        )

        max_marks = attrs.get(
            "max_marks",
            getattr(self.instance, "max_marks", None),
        )

        pass_marks = attrs.get(
            "pass_marks",
            getattr(self.instance, "pass_marks", None),
        )

        status = attrs.get(
            "status",
            getattr(
                self.instance,
                "status",
                Exam.DRAFT,
            ),
        )

        if batch and batch.center_id != center.id:
            raise serializers.ValidationError(
                {
                    "batch": (
                        "Selected batch does not belong "
                        "to your center."
                    )
                }
            )

        if duration_minutes is not None and duration_minutes <= 0:
            raise serializers.ValidationError(
                {
                    "duration_minutes": (
                        "Exam duration must be greater than zero."
                    )
                }
            )

        if max_marks is not None and max_marks <= 0:
            raise serializers.ValidationError(
                {
                    "max_marks": (
                        "Maximum marks must be greater than zero."
                    )
                }
            )

        if pass_marks is not None:

            if pass_marks < 0:
                raise serializers.ValidationError(
                    {
                        "pass_marks": (
                            "Pass marks cannot be negative."
                        )
                    }
                )

            if (
                max_marks is not None
                and pass_marks > max_marks
            ):
                raise serializers.ValidationError(
                    {
                        "pass_marks": (
                            "Pass marks cannot be greater "
                            "than maximum marks."
                        )
                    }
                )

        # Prevent duplicate exam records when creating/updating.
        if batch and exam_date:

            title = attrs.get(
                "title",
                getattr(self.instance, "title", None),
            )

            duplicate_query = Exam.objects.filter(
                batch=batch,
                exam_date=exam_date,
                title=title,
            )

            if self.instance:
                duplicate_query = duplicate_query.exclude(
                    pk=self.instance.pk
                )

            if duplicate_query.exists():
                raise serializers.ValidationError(
                    {
                        "title": (
                            "An exam with this title already "
                            "exists for this batch on this date."
                        )
                    }
                )

        # A cancelled exam should not remain ongoing.
        if status == Exam.CANCELLED:

            current_status = getattr(
                self.instance,
                "status",
                None,
            )

            if current_status == Exam.COMPLETED:
                raise serializers.ValidationError(
                    {
                        "status": (
                            "A completed exam cannot be cancelled."
                        )
                    }
                )

        return attrs