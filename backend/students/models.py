from django.db import models
from django.utils import timezone

from accounts.models import User
from centers.models import Center
from courses.models import Course
from batches.models import Batch
from django.core.exceptions import ValidationError

# Create your models here.

class Student(models.Model):

    # Student Login Account
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'}
    )

    # Admission Information
    registration_number = models.CharField(
        max_length=100,
        unique=True,
        blank=True
    )

    center = models.ForeignKey(
        Center,
        on_delete=models.PROTECT,
        related_name='students'
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name='students'
    )

    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name='students',
        blank=True,
        null=True
    )

    admission_date = models.DateField(
        auto_now_add=True
    )

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('COMPLETED', 'Completed'),
        ('DROPPED', 'Dropped'),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    # Personal Information
    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100,
        blank=True
    )

    father_name = models.CharField(
        max_length=100
    )

    mother_name = models.CharField(
        max_length=100,
        blank=True
    )

    date_of_birth = models.DateField()

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other')
    ]

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    # Contact Information
    email = models.EmailField(
        blank=True
    )

    phone = models.CharField(
        max_length=15
    )

    alternate_phone = models.CharField(
        max_length=15,
        blank=True
    )

    address = models.TextField()

    state = models.CharField(
        max_length=100,
        default='Bihar'
    )

    district = models.CharField(
        max_length=100
    )

    city = models.CharField(
        max_length=100
    )

    pincode = models.CharField(
        max_length=10
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if not self.registration_number:

            district = self.center.district
            center_code = self.center.center_code
            course_code = self.course.course_code
            year = timezone.now().year

            prefix = f"{district}/{center_code}/{course_code}/{year}"

            last_student = Student.objects.filter(
                registration_number__startswith = prefix
            ).order_by('-registration_number').first()

            if last_student:
                last_serial = int(last_student.registration_number.split('/')[-1])
                new_serial = last_serial + 1
            else:
                new_serial = 1

            self.registration_number = f"{prefix}/{new_serial:04d}"

        super().save(*args, **kwargs)

    def clean(self):
        if self.batch:
            if self.batch.center != self.center:
                raise ValidationError({
                    'batch': 'Selected batch does not belong to the selected center.'
                })

            if self.batch.course != self.course:
                raise ValidationError({
                    'batch': 'Selected batch does not belong to the selected course.'
                })
                
    def __str__(self):
        return f"{self.registration_number}"

    