from django.db import models

# Create your models here.

class Course(models.Model):

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    course_code = models.CharField(
        max_length=20,
        unique=True
    )

    course_name = models.CharField(
        max_length=100,
        unique=True
    )

    duration = models.CharField(
        max_length=50
    )

    fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"