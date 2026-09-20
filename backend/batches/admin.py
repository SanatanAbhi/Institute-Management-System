from django.contrib import admin
from .models import Batch

# Register your models here.

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):

    list_display = (
        'batch_code',
        'batch_name',
        'center',
        'course',
        'start_date',
        'end_date',
        'capacity',
        'status',
    )

    list_filter = (
        'status',
        'center',
        'course',
    )

    search_fields = (
        'batch_code',
        'batch_name',
    )

    ordering = (
        'start_date',
        'batch_code',
    )

    readonly_fields = (
        'batch_code',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Batch Information', {
            'fields': (
                'batch_code',
                'batch_name',
                'center',
                'course',
            )
        }),

        ('Batch Schedule', {
            'fields': (
                'start_date',
                'end_date',
            )
        }),

        ('Batch Capacity & Status', {
            'fields': (
                'capacity',
                'status',
            )
        }),

        ('System Information', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )