from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Exam(models.Model):

    # =========================
    # EXAM TYPES
    # =========================

    UNIT_TEST = "UNIT_TEST"
    MID_TERM = "MID_TERM"
    FINAL = "FINAL"
    PRACTICAL = "PRACTICAL"
    MOCK_TEST = "MOCK_TEST"
    OTHER = "OTHER"

    EXAM_TYPE_CHOICES = [
        (UNIT_TEST, "Unit Test"),
        (MID_TERM, "Mid Term"),
        (FINAL, "Final"),
        (PRACTICAL, "Practical"),
        (MOCK_TEST, "Mock Test"),
        (OTHER, "Other"),
    ]

    # =========================
    # EXAM STATUS
    # =========================

    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (SCHEDULED, "Scheduled"),
        (ONGOING, "Ongoing"),
        (COMPLETED, "Completed"),
        (CANCELLED, "Cancelled"),
    ]

    # =========================
    # RELATIONSHIPS
    # =========================

    center = models.ForeignKey(
        "centers.Center",
        on_delete=models.PROTECT,
        related_name="exams",
    )

    batch = models.ForeignKey(
        "batches.Batch",
        on_delete=models.PROTECT,
        related_name="exams",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_exams",
    )

    # =========================
    # EXAM INFORMATION
    # =========================

    title = models.CharField(
        max_length=150,
    )

    exam_type = models.CharField(
        max_length=20,
        choices=EXAM_TYPE_CHOICES,
        default=UNIT_TEST,
    )

    exam_date = models.DateField()

    start_time = models.TimeField()

    duration_minutes = models.PositiveIntegerField(
        default=60,
    )

    # =========================
    # MARKS
    # =========================

    max_marks = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=100,
    )

    pass_marks = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=40,
    )

    # =========================
    # OPTIONAL DETAILS
    # =========================

    room = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    instructions = models.TextField(
        blank=True,
        default="",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT,
    )

    # =========================
    # TIMESTAMPS
    # =========================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # =========================
    # VALIDATION
    # =========================

    def clean(self):

        errors = {}

        # Center must own the selected batch.
        if self.center_id and self.batch_id:

            if self.batch.center_id != self.center_id:
                errors["batch"] = (
                    "Selected batch does not belong to this center."
                )

        # Duration must be positive.
        if self.duration_minutes <= 0:
            errors["duration_minutes"] = (
                "Exam duration must be greater than zero."
            )

        # Maximum marks must be positive.
        if self.max_marks <= 0:
            errors["max_marks"] = (
                "Maximum marks must be greater than zero."
            )

        # Pass marks cannot exceed maximum marks.
        if self.pass_marks < 0:
            errors["pass_marks"] = (
                "Pass marks cannot be negative."
            )
        elif self.pass_marks > self.max_marks:
            errors["pass_marks"] = (
                "Pass marks cannot be greater than maximum marks."
            )

        if errors:
            raise ValidationError(errors)

    class Meta:

        ordering = [
            "-exam_date",
            "-start_time",
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "batch",
                    "exam_date",
                    "title",
                ],
                name="unique_batch_exam_title_date",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "center",
                    "exam_date",
                ],
                name="exam_center_date_idx",
            ),
            models.Index(
                fields=[
                    "batch",
                    "exam_date",
                ],
                name="exam_batch_date_idx",
            ),
            models.Index(
                fields=[
                    "status",
                    "exam_date",
                ],
                name="exam_status_date_idx",
            ),
        ]

    def __str__(self):

        return (
            f"{self.title} - "
            f"{self.batch} - "
            f"{self.exam_date}"
        )