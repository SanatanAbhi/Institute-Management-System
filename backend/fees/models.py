from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from admissions.models import Admission
from centers.models import Center
from students.models import Student


class Fee(models.Model):
    PAYMENT_MODE_CHOICES = [
        ("CASH", "Cash"),
        ("UPI", "UPI"),
        ("CARD", "Card"),
        ("BANK_TRANSFER", "Bank Transfer"),
        ("CHEQUE", "Cheque"),
        ("OTHER", "Other"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("SUCCESS", "Success"),
        ("PENDING", "Pending"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    ]

    receipt_number = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        db_index=True,
    )

    admission = models.ForeignKey(
        Admission,
        on_delete=models.PROTECT,
        related_name="fee_payments",
    )

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="fee_payments",
    )

    center = models.ForeignKey(
        Center,
        on_delete=models.PROTECT,
        related_name="fee_payments",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_date = models.DateField(
        default=timezone.now,
    )

    payment_mode = models.CharField(
        max_length=30,
        choices=PAYMENT_MODE_CHOICES,
        default="CASH",
    )

    transaction_reference = models.CharField(
        max_length=150,
        blank=True,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="SUCCESS",
        db_index=True,
    )

    remarks = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def clean(self):
        if self.amount <= Decimal("0"):
            raise ValidationError(
                {"amount": "Payment amount must be greater than zero."}
            )

        if self.student and self.admission:
            if self.admission.student_id != self.student_id:
                raise ValidationError(
                    {
                        "student": (
                            "Selected student does not belong to the selected admission."
                        )
                    }
                )

        if self.center and self.admission:
            if self.admission.center_id != self.center_id:
                raise ValidationError(
                    {
                        "center": (
                            "Selected center does not belong to the selected admission."
                        )
                    }
                )

        if self.center and self.student:
            if self.student.center_id != self.center_id:
                raise ValidationError(
                    {
                        "center": (
                            "Selected center does not belong to the selected student."
                        )
                    }
                )

        if (
            self.payment_mode in {"UPI", "CARD", "BANK_TRANSFER", "CHEQUE"}
            and self.payment_status == "SUCCESS"
            and not self.transaction_reference.strip()
        ):
            raise ValidationError(
                {
                    "transaction_reference": (
                        "Transaction reference is required for this payment mode."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        if not self.receipt_number:
            year = timezone.now().year
            center_code = self.center.center_code
            prefix = f"REC/{center_code}/{year}"

            last_payment = (
                Fee.objects.filter(
                    receipt_number__startswith=prefix
                )
                .order_by("-receipt_number")
                .first()
            )

            if last_payment:
                last_serial = int(
                    last_payment.receipt_number.split("/")[-1]
                )
                new_serial = last_serial + 1
            else:
                new_serial = 1

            self.receipt_number = f"{prefix}/{new_serial:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.receipt_number} - ₹{self.amount}"

    class Meta:
        verbose_name = "Fee Payment"
        verbose_name_plural = "Fee Payments"
        ordering = ["-payment_date", "-created_at"]

        indexes = [
            models.Index(fields=["center", "payment_date"]),
            models.Index(fields=["student", "payment_date"]),
            models.Index(fields=["admission", "payment_date"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["payment_mode"]),
            models.Index(fields=["receipt_number"]),
        ]