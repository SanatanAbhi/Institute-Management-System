
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from rest_framework import serializers

from .models import Center

User = get_user_model()


class CenterSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating center information."""

    class Meta:
        model = Center
        fields = [
            "id",
            "center_code",
            "center_name",
            "owner_name",
            "owner_photo",
            "email",
            "phone",
            "address",
            "state",
            "district",
            "city",
            "pincode",
            "logo",
            "status",
            "registration_date",
            "expiry_date",
            "is_lifetime",
        ]
        read_only_fields = [
            "id",
            "center_code",
            "registration_date",
        ]

    def validate_email(self, value):
        center = self.instance

        # Prevent duplicate center email addresses.
        center_query = Center.objects.filter(email=value)
        if center:
            center_query = center_query.exclude(pk=center.pk)

        if center_query.exists():
            raise serializers.ValidationError(
                "A center with this email already exists."
            )

        # Prevent conflicts with another user account.
        user_query = User.objects.filter(email=value)
        if center:
            user_query = user_query.exclude(pk=center.user_id)

        if user_query.exists():
            raise serializers.ValidationError(
                "This email is already used by another user account."
            )

        return value

    def validate(self, attrs):
        is_lifetime = attrs.get(
            "is_lifetime",
            self.instance.is_lifetime if self.instance else False,
        )

        if is_lifetime:
            attrs["expiry_date"] = None

        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        center_email = validated_data.get("email", instance.email)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        # Keep the linked center login account's email synchronized.
        if instance.user.email != center_email:
            instance.user.email = center_email
            instance.user.save(update_fields=["email"])

        return instance


class CenterCreateSerializer(serializers.ModelSerializer):
    """Create a center and its linked CENTER user account."""

    username = serializers.CharField(
        write_only=True,
        required=False,
    )

    created_username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        validators=[validate_password],
    )

    class Meta:
        model = Center
        fields = [
            "id",
            "username",
            "created_username",
            "password",
            "center_name",
            "owner_name",
            "owner_photo",
            "email",
            "phone",
            "address",
            "state",
            "district",
            "city",
            "pincode",
            "logo",
            "status",
            "expiry_date",
            "is_lifetime",
        ]
        read_only_fields = ["id"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already used by a user account."
            )

        if Center.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A center with this email already exists."
            )

        return value

    def validate(self, attrs):
        if not attrs.get("username"):
            import uuid

            attrs["username"] = f"center_{uuid.uuid4().hex[:12]}"

        if attrs.get("is_lifetime"):
            attrs["expiry_date"] = None

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        email = validated_data["email"]

        user = User(
            username=username,
            email=email,
            role="CENTER",
            is_active=True,
        )
        user.set_password(password)
        user.save()

        center = Center.objects.create(
            user=user,
            **validated_data,
        )

        return center
