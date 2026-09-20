from django.db import models
from accounts.models import User

# Create your models here.

class Center(models.Model):

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
        ('EXPIRED', 'Expired'),
    ]

    DISTRICT_CHOICES = [
        ('PTN', 'Patna'),
        ('GYA', 'Gaya'),
        ('MUZ', 'Muzaffarpur'),
        ('BGP', 'Bhagalpur'),
    ]

    # Center Login User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'CENTER'}
    )

    # Center Information
    center_code = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )
    center_name = models.CharField(max_length=200, unique=True)

    # Owner Information
    owner_name = models.CharField(max_length=100)
    owner_photo = models.ImageField(
        upload_to='owner_photos/',
        blank=True,
        null=True
    )

    # Contact Information
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)

    # Address Information
    address = models.TextField()

    state = models.CharField(
        max_length=100,
        default='Bihar'
    )

    district = models.CharField(
        max_length=10,
        choices=DISTRICT_CHOICES,
    )
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    # Center Logo
    logo = models.ImageField(
        upload_to='center_logos/',
        blank=True,
        null=True
    )

    # Center Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # Membership Details
    registration_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField(
        blank=True,
        null=True
    )
    is_lifetime = models.BooleanField(default=False)

    # Audit Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.center_code} - {self.center_name}"

    def save(self, *args, **kwargs):

        if not self.center_code:

            last_center = Center.objects.filter(
                district=self.district
            ).order_by('-center_code').first()

            if last_center:

                last_number = int(
                    last_center.center_code[len(self.district):]
                )

                new_number = last_number + 1

            else:

                new_number = 1

            self.center_code = f"{self.district}{new_number:03d}"

        super().save(*args, **kwargs)

