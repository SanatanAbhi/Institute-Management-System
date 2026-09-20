from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

from centers.models import Center
from courses.models import Course

# Create your models here.

class Batch(models.Model):

    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    batch_code = models.CharField(
        max_length=50,
        unique=True,
        blank=True
    )

    batch_name = models.CharField(
        max_length=100
    )

    center = models.ForeignKey(
        Center,
        on_delete=models.PROTECT,
        related_name='batches'
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name='batches'
    )

    start_date = models.DateField()
    end_date = models.DateField()

    capacity = models.PositiveIntegerField(
        default=30
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='UPCOMING'
    )

    created_at = models.DateTimeField(
        auto_now_add = True
    )

    updated_at = models.DateTimeField(
        auto_now = True
    )

    class Meta:
        verbose_name = 'Batch'
        verbose_name_plural = 'Batches'

    def clean(self):
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                raise ValidationError('End date must be after start date')

    def save(self, *args, **kwargs):

        if not self.batch_code:

            course_code = self.course.course_code
            center_code = self.center.center_code
            year = timezone.now().year

            prefix = f"{course_code}-{center_code}-{year}"

            last_batch = Batch.objects.filter(
                batch_code__startswith = prefix
            ).order_by('-batch_code').first()

            if last_batch:
                last_serial = int(last_batch.batch_code.split('-')[-1])

                new_serial = last_serial + 1
            else:
                new_serial = 1

            self.batch_code = f"{prefix}-{new_serial:02d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.batch_code} - {self.batch_name}"