from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import User


class SuperAdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        trim_whitespace=False,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_active",
            "date_joined",
            "last_login",
            "created_at",
            "updated_at",
            "password",
        ]

        read_only_fields = [
            "id",
            "date_joined",
            "last_login",
            "created_at",
            "updated_at",
        ]

    def validate_password(self, value):
        validate_password(value, user=self.instance)
        return value

    def validate(self, attrs):
        instance = self.instance
        request = self.context.get("request")

        # Prevent a Super Admin from accidentally locking themselves out.
        if instance and request and request.user.pk == instance.pk:
            new_role = attrs.get("role", instance.role)
            new_active_status = attrs.get(
                "is_active",
                instance.is_active,
            )

            if new_role != "SUPER_ADMIN":
                raise serializers.ValidationError({
                    "role": (
                        "You cannot remove your own Super Admin role."
                    )
                })

            if not new_active_status:
                raise serializers.ValidationError({
                    "is_active": (
                        "You cannot deactivate your own account."
                    )
                })

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        if not password:
            raise serializers.ValidationError({
                "password": "A password is required when creating a user."
            })

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        # Never save a raw password directly to the database.
        if password:
            instance.set_password(password)

        instance.save()

        return instance