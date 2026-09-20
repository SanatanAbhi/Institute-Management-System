from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here

@admin.register(User)
class CustomUserAdmin(UserAdmin):

    model = User

    list_display = (
        'username',
        'email',
        'role',
        'is_staff',
        'is_active',
    )

    list_filter = (
        'role',
        'is_staff',
        'is_active',
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            'Role Information',
            {
                'fields': (
                    'role',
                    'created_at',
                    'updated_at',
                )
            },
        ),
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            'Role Information',
            {
                'fields': (
                    'role',
                )
            },
        ),
    )