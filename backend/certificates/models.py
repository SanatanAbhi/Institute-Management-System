import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


def generate_certificate_number():
    year = timezone.localdate().year
    unique_part = uuid.uuid4().hex[:10].upper()

    return f"IMS-{year}-{unique_part}"


class Certificate(models.Model):

    # =========================
    # CERTIFICATE STATUS
    # =========================

    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    REVOKED = "REVOKED"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (ISSUED, "Issued"),
        (REVOKED, "Revoked"),
    ]

    # =========================
    # GRADE
    # =========================

    GRADE_CHOICES = [
        ("A+", "A+"),
        ("A", "A"),
        ("B+", "B+"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
        ("F", "F"),
    ]

    # =========================
    # RELATIONSHIPS
    # =========================

    center = models.ForeignKey(
        "centers.Center",
        on_delete=models.PROTECT,
        related_name="certificates",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.PROTECT,
        related_name="certificates",
    )

    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.PROTECT,
        related_name="certificates",
    )

    result = models.ForeignKey(
        "results.Result",
        on_delete=models.PROTECT,
        related_name="certificates",
    )

    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="issued_certificates",
    )

    # =========================
    # CERTIFICATE INFORMATION
    # =========================

    certificate_number = models.CharField(
        max_length=40,
        unique=True,
        default=generate_certificate_number,
        editable=False,
    )

    completion_date = models.DateField()

    issue_date = models.DateField(
        null=True,
        blank=True,
    )

    grade = models.CharField(
        max_length=5,
        choices=GRADE_CHOICES,
        editable=False,
    )

    percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        editable=False,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT,
    )

    remarks = models.TextField(
        blank=True,
        default="",
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

        if self.center_id and self.student_id:
            if self.student.center_id != self.center_id:
                errors["student"] = (
                    "Selected student does not belong "
                    "to this center."
                )

        if self.center_id and self.result_id:
            if self.result.center_id != self.center_id:
                errors["result"] = (
                    "Selected result does not belong "
                    "to this center."
                )

        if self.student_id and self.result_id:
            if self.result.student_id != self.student_id:
                errors["result"] = (
                    "Selected result does not belong "
                    "to this student."
                )

        if self.result_id and self.course_id:

            result_course_id = getattr(
                self.result.exam.batch,
                "course_id",
                None,
            )

            if result_course_id != self.course_id:
                errors["course"] = (
                    "Selected course does not match "
                    "the course associated with the result."
                )

        if self.student_id and self.course_id:

            student_course_id = getattr(
                self.student,
                "course_id",
                None,
            )

            if (
                student_course_id is not None
                and student_course_id != self.course_id
            ):
                errors["course"] = (
                    "Selected course does not match "
                    "the student's course."
                )

        if self.result_id:

            if self.result.result_status != "PASS":
                errors["result"] = (
                    "A certificate can only be issued "
                    "for a passing result."
                )

        if (
            self.issue_date
            and self.completion_date
            and self.issue_date < self.completion_date
        ):
            errors["issue_date"] = (
                "Issue date cannot be before "
                "the completion date."
            )

        if self.status == self.ISSUED and not self.issue_date:
            errors["issue_date"] = (
                "An issue date is required for an issued certificate."
            )

        if errors:
            raise ValidationError(errors)

    # =========================
    # SAVE
    # =========================

    def save(self, *args, **kwargs):

        if self.result_id:

            self.grade = self.result.grade

            self.percentage = self.result.percentage

        if self.status == self.ISSUED and not self.issue_date:
            self.issue_date = timezone.localdate()

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    # =========================
    # META
    # =========================

    class Meta:

        ordering = [
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "course",
                ],
                name="unique_student_course_certificate",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "center",
                    "status",
                ],
                name="cert_center_status_idx",
            ),
            models.Index(
                fields=[
                    "student",
                    "course",
                ],
                name="cert_student_course_idx",
            ),
            models.Index(
                fields=[
                    "issue_date",
                    "status",
                ],
                name="cert_issue_status_idx",
            ),
        ]

    def __str__(self):

        return (
            f"{self.certificate_number} - "
            f"{self.student} - "
            f"{self.course}"
        )