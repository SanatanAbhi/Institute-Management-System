from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", "New"
        CONTACTED = "CONTACTED", "Contacted"
        IN_REVIEW = "IN_REVIEW", "In Review"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    full_name = models.CharField(max_length=150)

    phone = models.CharField(max_length=20)

    email = models.EmailField(max_length=254)

    course = models.CharField(max_length=150)

    qualification = models.CharField(max_length=150)

    city = models.CharField(max_length=100)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )

    remarks = models.TextField(
        blank=True,
        help_text="Internal notes entered by authorized staff.",
    )

    applied_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        verbose_name = "Application"
        verbose_name_plural = "Applications"
        indexes = [
            models.Index(
                fields=["phone", "applied_at"],
                name="app_phone_date_idx",
            ),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.course} ({self.status})"