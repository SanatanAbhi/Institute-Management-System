from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

from students.models import Student
from centers.models import Center
from courses.models import Course
from batches.models import Batch


class Admission(models.Model):

    # ==========================================================
    # ADMISSION STATUS
    # ==========================================================

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
    ]

    # ==========================================================
    # PAYMENT STATUS
    # ==========================================================

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PARTIAL", "Partial"),
        ("PAID", "Paid"),
    ]

    # ==========================================================
    # PRIMARY INFORMATION
    # ==========================================================

    admission_number = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        db_index=True,
    )

    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name="admissions",
    )

    center = models.ForeignKey(
        Center,
        on_delete=models.PROTECT,
        related_name="admissions",
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name="admissions",
    )

    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name="admissions",
    )

    # ==========================================================
    # ADMISSION DETAILS
    # ==========================================================

    admission_date = models.DateField(
        default=timezone.now,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="CONFIRMED",
        db_index=True,
    )

    # ==========================================================
    # FEE INFORMATION
    # ==========================================================

    course_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    final_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    pending_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="PENDING",
        db_index=True,
    )

    # ==========================================================
    # ADDITIONAL INFORMATION
    # ==========================================================

    remarks = models.TextField(
        blank=True,
    )

    # ==========================================================
    # AUDIT INFORMATION
    # ==========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ==========================================================
    # VALIDATION
    # ==========================================================

    def clean(self):

        if self.student and self.center:
            if self.student.center_id != self.center_id:
                raise ValidationError({
                    "student": "Selected student does not belong to the selected center."
                })

        if self.batch and self.center:
            if self.batch.center_id != self.center_id:
                raise ValidationError({
                    "batch": "Selected batch does not belong to the selected center."
                })

        if self.batch and self.course:
            if self.batch.course_id != self.course_id:
                raise ValidationError({
                    "batch": "Selected batch does not belong to the selected course."
                })

        if self.student and self.course:
            if self.student.course_id != self.course_id:
                raise ValidationError({
                    "course": "Selected course does not match the student's course."
                })

        if self.discount < 0:
            raise ValidationError({
                "discount": "Discount cannot be negative."
            })

        if self.paid_amount < 0:
            raise ValidationError({
                "paid_amount": "Paid amount cannot be negative."
            })

        if self.discount > self.course_fee:
            raise ValidationError({
                "discount": "Discount cannot be greater than course fee."
            })

        calculated_final_fee = self.course_fee - self.discount

        if self.paid_amount > calculated_final_fee:
            raise ValidationError({
                "paid_amount": "Paid amount cannot be greater than final fee."
            })

    # ==========================================================
    # SAVE
    # ==========================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        # Calculate final fee
        self.final_fee = self.course_fee - self.discount

        # Calculate pending fee
        self.pending_amount = self.final_fee - self.paid_amount

        # Determine payment status
        if self.paid_amount <= 0:
            self.payment_status = "PENDING"

        elif self.paid_amount < self.final_fee:
            self.payment_status = "PARTIAL"

        else:
            self.payment_status = "PAID"

        # Generate admission number
        if not self.admission_number:

            year = timezone.now().year

            center_code = self.center.center_code

            prefix = f"ADM/{center_code}/{year}"

            last_admission = (
                Admission.objects
                .filter(
                    admission_number__startswith=prefix
                )
                .order_by("-admission_number")
                .first()
            )

            if last_admission:

                last_serial = int(
                    last_admission.admission_number.split("/")[-1]
                )

                new_serial = last_serial + 1

            else:
                new_serial = 1

            self.admission_number = (
                f"{prefix}/{new_serial:04d}"
            )

        super().save(*args, **kwargs)

    # ==========================================================
    # STRING REPRESENTATION
    # ==========================================================

    def __str__(self):
        return (
            f"{self.admission_number} - "
            f"{self.student.first_name} "
            f"{self.student.last_name}"
        )

    # ==========================================================
    # META
    # ==========================================================

    class Meta:

        verbose_name = "Admission"
        verbose_name_plural = "Admissions"

        ordering = ["-created_at"]

        indexes = [
            models.Index(
                fields=["center", "status"]
            ),
            models.Index(
                fields=["student", "status"]
            ),
            models.Index(
                fields=["course", "status"]
            ),
            models.Index(
                fields=["batch", "status"]
            ),
            models.Index(
                fields=["admission_date"]
            ),
        ]