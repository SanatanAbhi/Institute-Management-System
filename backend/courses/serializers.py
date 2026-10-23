from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id", "course_code", "course_name", "duration", "fee",
            "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_fee(self, value):
        if value < 0:
            raise serializers.ValidationError("Fee cannot be negative.")
        return value

    def validate_course_code(self, value):
        return value.strip().upper()

    def validate_course_name(self, value):
        return value.strip()

    def validate_duration(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Duration is required.")
        return value
