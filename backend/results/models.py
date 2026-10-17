from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Result(models.Model):

    # =========================
    # ATTENDANCE STATUS
    # =========================

    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    EXCUSED = "EXCUSED"

    ATTENDANCE_STATUS_CHOICES = [
        (PRESENT, "Present"),
        (ABSENT, "Absent"),
        (EXCUSED, "Excused"),
    ]

    # =========================
    # RESULT STATUS
    # =========================

    PASS = "PASS"
    FAIL = "FAIL"
    ABSENT_RESULT = "ABSENT"

    RESULT_STATUS_CHOICES = [
        (PASS, "Pass"),
        (FAIL, "Fail"),
        (ABSENT_RESULT, "Absent"),
    ]

    # =========================
    # GRADE
    # =========================

    A_PLUS = "A+"
    A = "A"
    B_PLUS = "B+"
    B = "B"
    C = "C"
    D = "D"
    F = "F"

    GRADE_CHOICES = [
        (A_PLUS, "A+"),
        (A, "A"),
        (B_PLUS, "B+"),
        (B, "B"),
        (C, "C"),
        (D, "D"),
        (F, "F"),
    ]

    # =========================
    # RELATIONSHIPS
    # =========================

    center = models.ForeignKey(
        "centers.Center",
        on_delete=models.PROTECT,
        related_name="results",
    )

    exam = models.ForeignKey(
        "exams.Exam",
        on_delete=models.PROTECT,
        related_name="results",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.PROTECT,
        related_name="exam_results",
    )

    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="entered_results",
    )

    # =========================
    # RESULT INFORMATION
    # =========================

    marks_obtained = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
    )

    attendance_status = models.CharField(
        max_length=20,
        choices=ATTENDANCE_STATUS_CHOICES,
        default=PRESENT,
    )

    remarks = models.TextField(
        blank=True,
        default="",
    )

    # =========================
    # CALCULATED RESULT FIELDS
    # =========================

    percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        editable=False,
    )

    grade = models.CharField(
        max_length=5,
        choices=GRADE_CHOICES,
        default=F,
        editable=False,
    )

    result_status = models.CharField(
        max_length=20,
        choices=RESULT_STATUS_CHOICES,
        default=FAIL,
        editable=False,
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
    # CALCULATION HELPERS
    # =========================

    def calculate_percentage(self):

        max_marks = self.exam.max_marks

        if not max_marks or max_marks <= 0:
            return 0

        percentage = (
            self.marks_obtained / max_marks
        ) * 100

        return round(
            percentage,
            2,
        )

    def calculate_grade(self, percentage):

        if percentage >= 90:
            return self.A_PLUS

        if percentage >= 80:
            return self.A

        if percentage >= 70:
            return self.B_PLUS

        if percentage >= 60:
            return self.B

        if percentage >= 50:
            return self.C

        if percentage >= 40:
            return self.D

        return self.F

    def calculate_result_status(self):

        if self.attendance_status == self.ABSENT:
            return self.ABSENT_RESULT

        if self.marks_obtained >= self.exam.pass_marks:
            return self.PASS

        return self.FAIL

    # =========================
    # VALIDATION
    # =========================

    def clean(self):

        errors = {}

        if self.exam_id and self.center_id:

            if self.exam.center_id != self.center_id:
                errors["exam"] = (
                    "Selected exam does not belong to this center."
                )

        if self.student_id and self.center_id:

            if self.student.center_id != self.center_id:
                errors["student"] = (
                    "Selected student does not belong to this center."
                )

        if self.exam_id and self.student_id:

            exam_batch_id = self.exam.batch_id

            student_batch_id = getattr(
                self.student,
                "batch_id",
                None,
            )

            if (
                student_batch_id is not None
                and student_batch_id != exam_batch_id
            ):
                errors["student"] = (
                    "Selected student does not belong "
                    "to the exam batch."
                )

        if self.marks_obtained < 0:
            errors["marks_obtained"] = (
                "Marks obtained cannot be negative."
            )

        if self.exam_id:

            max_marks = self.exam.max_marks

            if self.marks_obtained > max_marks:
                errors["marks_obtained"] = (
                    "Marks obtained cannot be greater "
                    "than the maximum marks."
                )

        if self.attendance_status == self.ABSENT:

            if self.marks_obtained != 0:
                errors["marks_obtained"] = (
                    "Absent students must have zero marks."
                )

        if errors:
            raise ValidationError(errors)

    # =========================
    # SAVE
    # =========================

    def save(self, *args, **kwargs):

        self.full_clean()

        if self.exam_id:

            self.percentage = (
                self.calculate_percentage()
            )

            self.grade = self.calculate_grade(
                self.percentage
            )

            self.result_status = (
                self.calculate_result_status()
            )

        super().save(
            *args,
            **kwargs,
        )

    # =========================
    # META
    # =========================

    class Meta:

        ordering = [
            "-updated_at",
            "-created_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "exam",
                    "student",
                ],
                name="unique_student_result_per_exam",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "center",
                    "exam",
                ],
                name="result_center_exam_idx",
            ),
            models.Index(
                fields=[
                    "exam",
                    "student",
                ],
                name="result_exam_student_idx",
            ),
            models.Index(
                fields=[
                    "student",
                    "created_at",
                ],
                name="result_student_created_idx",
            ),
            models.Index(
                fields=[
                    "result_status",
                    "exam",
                ],
                name="result_status_exam_idx",
            ),
        ]

    def __str__(self):

        return (
            f"{self.student} - "
            f"{self.exam.title} - "
            f"{self.marks_obtained}/"
            f"{self.exam.max_marks}"
        )