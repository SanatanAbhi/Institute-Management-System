from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from accounts.models import User
from admissions.models import Admission

from .models import Fee


class CenterFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    registration_number = serializers.CharField(
        source="student.registration_number",
        read_only=True,
    )
    admission_number = serializers.CharField(
        source="admission.admission_number",
        read_only=True,
    )
    course_name = serializers.CharField(
        source="admission.course.course_name",
        read_only=True,
    )
    batch_name = serializers.CharField(
        source="admission.batch.batch_name",
        read_only=True,
    )
    center_name = serializers.CharField(
        source="center.center_name",
        read_only=True,
    )

    class Meta:
        model = Fee
        fields = [
            "id",
            "receipt_number",
            "admission",
            "admission_number",
            "student",
            "student_name",
            "registration_number",
            "center",
            "center_name",
            "course_name",
            "batch_name",
            "amount",
            "payment_date",
            "payment_mode",
            "transaction_reference",
            "payment_status",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "receipt_number",
            "student",
            "student_name",
            "registration_number",
            "center",
            "center_name",
            "admission_number",
            "course_name",
            "batch_name",
            "created_at",
            "updated_at",
        ]

    def get_student_name(self, obj):
        full_name = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return full_name or obj.student.user.username


class CenterFeeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = [
            "admission",
            "amount",
            "payment_date",
            "payment_mode",
            "transaction_reference",
            "payment_status",
            "remarks",
        ]

    def validate_admission(self, admission):
        request = self.context["request"]

        if not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if request.user.role != "CENTER":
            raise serializers.ValidationError(
                "Only center users can create or update fee payments."
            )

        try:
            center = request.user.center
        except AttributeError:
            raise serializers.ValidationError(
                "Your account is not linked to a center."
            )

        if admission.center_id != center.id:
            raise serializers.ValidationError(
                "Selected admission does not belong to your center."
            )

        return admission

    def validate(self, attrs):
        admission = attrs.get("admission")

        if admission is None and self.instance:
            admission = self.instance.admission

        amount = attrs.get(
            "amount",
            self.instance.amount if self.instance else None,
        )

        payment_status = attrs.get(
            "payment_status",
            self.instance.payment_status
            if self.instance
            else "SUCCESS",
        )

        payment_mode = attrs.get(
            "payment_mode",
            self.instance.payment_mode
            if self.instance
            else "CASH",
        )

        transaction_reference = attrs.get(
            "transaction_reference",
            self.instance.transaction_reference
            if self.instance
            else "",
        )

        if amount is None:
            raise serializers.ValidationError(
                {"amount": "Payment amount is required."}
            )

        if amount <= Decimal("0"):
            raise serializers.ValidationError(
                {"amount": "Payment amount must be greater than zero."}
            )

        if (
            payment_mode in {
                "UPI",
                "CARD",
                "BANK_TRANSFER",
                "CHEQUE",
            }
            and payment_status == "SUCCESS"
            and not transaction_reference.strip()
        ):
            raise serializers.ValidationError(
                {
                    "transaction_reference": (
                        "Transaction reference is required "
                        "for this payment mode."
                    )
                }
            )

        if admission:
            existing_paid = (
                Fee.objects.filter(
                    admission=admission,
                    payment_status="SUCCESS",
                )
                .exclude(
                    pk=self.instance.pk
                    if self.instance
                    else None
                )
                .aggregate(total=Sum("amount"))
                .get("total")
                or Decimal("0")
            )

            final_fee = admission.final_fee or Decimal("0")
            remaining_amount = final_fee - existing_paid

            if payment_status == "SUCCESS":
                if remaining_amount <= Decimal("0"):
                    raise serializers.ValidationError(
                        {
                            "amount": (
                                "The admission fee has already been "
                                "fully paid."
                            )
                        }
                    )

                if amount > remaining_amount:
                    raise serializers.ValidationError(
                        {
                            "amount": (
                                f"Maximum payable amount is "
                                f"₹{remaining_amount}."
                            )
                        }
                    )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        admission = validated_data["admission"]

        try:
            center = request.user.center
        except AttributeError:
            raise serializers.ValidationError(
                "Your account is not linked to a center."
            )

        validated_data["center"] = center
        validated_data["student"] = admission.student

        return Fee.objects.create(**validated_data)

    def update(self, instance, validated_data):
        admission = validated_data.get(
            "admission",
            instance.admission,
        )

        instance.admission = admission
        instance.student = admission.student
        instance.center = admission.center

        for field, value in validated_data.items():
            if field != "admission":
                setattr(instance, field, value)

        instance.save()

        return instance