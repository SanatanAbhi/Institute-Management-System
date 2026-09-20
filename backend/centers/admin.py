from django.contrib import admin
from .models import Center


@admin.register(Center)
class CenterAdmin(admin.ModelAdmin):

    # Columns displayed in the Center list page
    list_display = (
        'center_code',
        'center_name',
        'owner_name',
        'phone',
        'status',
        'is_lifetime',
        'expiry_date',
    )

    # Search box fields
    search_fields = (
        'center_code',
        'center_name',
        'owner_name',
        'email',
        'phone',
    )

    # Filters shown on the right side
    list_filter = (
        'status',
        'is_lifetime',
        'state',
    )

    # Default ordering
    ordering = (
        'center_code',
    )

    # Read-only fields
    readonly_fields = (
        'registration_date',
        'created_at',
        'updated_at',
    )

    # Number of records per page
    list_per_page = 20