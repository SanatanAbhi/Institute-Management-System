from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Attendance(models.Model):

    # ==============================
    # Attendance Status
    # ==============================

    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    HALF_DAY = "HALF_DAY"

    STATUS_CHOICES = [
        (PRESENT, "Present"),
        (ABSENT, "Absent"),
        (LATE, "Late"),
        (HALF_DAY, "Half Day"),
    ]

    # ==============================
    # Relationships
    # ==============================

    center = models.ForeignKey(
        "centers.Center",
        on_delete=models.PROTECT,
        related_name="attendance_records",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.PROTECT,
        related_name="attendance_records",
    )

    batch = models.ForeignKey(
        "batches.Batch",
        on_delete=models.PROTECT,
        related_name="attendance_records",
    )

    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="marked_attendance_records",
    )

    # ==============================
    # Attendance Information
    # ==============================

    date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PRESENT,
    )

    remarks = models.TextField(
        blank=True,
        default="",
    )

    # ==============================
    # Timestamps
    # ==============================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # ==============================
    # Validation
    # ==============================

    def clean(self):

        errors = {}

        if self.student_id and self.center_id:

            if self.student.center_id != self.center_id:
                errors["student"] = (
                    "Selected student does not belong to this center."
                )

        if self.batch_id and self.center_id:

            if self.batch.center_id != self.center_id:
                errors["batch"] = (
                    "Selected batch does not belong to this center."
                )

        if self.student_id and self.batch_id:

            student_batch_id = getattr(
                self.student,
                "batch_id",
                None,
            )

            if (
                student_batch_id is not None
                and student_batch_id != self.batch_id
            ):
                errors["batch"] = (
                    "Selected batch is not assigned to this student."
                )

        if errors:
            raise ValidationError(errors)

    # ==============================
    # Database Rules
    # ==============================

    class Meta:

        ordering = [
            "-date",
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "date",
                ],
                name="unique_student_attendance_per_day",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "center",
                    "date",
                ],
                name="attendance_center_date_idx",
            ),
            models.Index(
                fields=[
                    "batch",
                    "date",
                ],
                name="attendance_batch_date_idx",
            ),
            models.Index(
                fields=[
                    "student",
                    "date",
                ],
                name="attendance_student_date_idx",
            ),
            models.Index(
                fields=[
                    "status",
                    "date",
                ],
                name="attendance_status_date_idx",
            ),
        ]

    # ==============================
    # String Representation
    # ==============================

    def __str__(self):

        return (
            f"{self.student} - "
            f"{self.date} - "
            f"{self.get_status_display()}"
        )