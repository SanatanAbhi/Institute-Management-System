import re

from rest_framework import serializers

from .models import Application


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id",
            "full_name",
            "phone",
            "email",
            "course",
            "qualification",
            "city",
            "status",
            "applied_at",
        ]
        read_only_fields = ["id", "status", "applied_at"]

    def validate_full_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )

        if len(value) < 2:
            raise serializers.ValidationError(
                "Full name must contain at least 2 characters."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if not re.fullmatch(r"[0-9]{10}", value):
            raise serializers.ValidationError(
                "Enter a valid 10-digit mobile number."
            )

        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_course(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Please enter the course you are interested in."
            )

        return value

    def validate_qualification(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Qualification is required."
            )

        return value

    def validate_city(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "City is required."
            )

        return value