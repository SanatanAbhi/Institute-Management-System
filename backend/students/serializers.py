from django.db import transaction
from rest_framework import serializers

from .models import Student
from accounts.models import User


class CenterStudentSerializer(serializers.ModelSerializer):

    course_name = serializers.CharField(
        source="course.course_name",
        read_only=True
    )

    batch_name = serializers.CharField(
        source="batch.batch_name",
        read_only=True
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Student

        fields = [
            "id",
            "username",
            "registration_number",
            "first_name",
            "last_name",
            "father_name",
            "mother_name",
            "date_of_birth",
            "gender",
            "email",
            "phone",
            "alternate_phone",
            "address",
            "state",
            "district",
            "city",
            "pincode",
            "course",
            "course_name",
            "batch",
            "batch_name",
            "admission_date",
            "status",
            "created_at",
            "updated_at",
        ]


class CenterStudentCreateSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        write_only=True,
        max_length=150
    )

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = Student

        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "father_name",
            "mother_name",
            "date_of_birth",
            "gender",
            "email",
            "phone",
            "alternate_phone",
            "address",
            "state",
            "district",
            "city",
            "pincode",
            "course",
            "batch",
            "status",
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This username already exists."
            )

        return value

    def validate(self, attrs):

        center = self.context["request"].user.center

        batch = attrs.get("batch")
        course = attrs.get("course")

        if batch:

            if batch.center_id != center.id:
                raise serializers.ValidationError({
                    "batch": "Selected batch does not belong to your center."
                })

            if batch.course_id != course.id:
                raise serializers.ValidationError({
                    "batch": "Selected batch does not belong to the selected course."
                })

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        username = validated_data.pop("username")
        password = validated_data.pop("password")

        center = self.context["request"].user.center

        user = User.objects.create_user(
            username=username,
            password=password,
            role="STUDENT"
        )

        student = Student.objects.create(
            user=user,
            center=center,
            **validated_data
        )

        return student