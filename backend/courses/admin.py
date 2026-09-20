from django.contrib import admin
from .models import Course

# Register your models here.

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):

    list_display = (
        'course_code',
        'course_name',
        'duration',
        'fee',
        'status',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'course_code',
        'course_name',
    )

    ordering = (
        'course_name',
    )
