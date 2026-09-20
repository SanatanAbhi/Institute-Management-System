from django.contrib import admin
from .models import Student
from batches.models import Batch
from .forms import StudentForm

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):

    form = StudentForm

    list_display = (
        'registration_number',
        'first_name',
        'last_name',
        'center',
        'course',
        'status',
        'phone',
    )

    list_filter = (
        'status',
        'center',
        'course',
        'gender',
    )

    search_fields = (
        'registration_number',
        'first_name',
        'last_name',
        'father_name',
        'phone',
    )

    ordering = (
        'registration_number',
    )

    readonly_fields = (
        'registration_number',
        'admission_date',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Account Information', {
            'fields': (
                'user',
            )
        }),

        ('Admission Information', {
            'fields': (
                'registration_number',
                'center',
                'course',
                'batch',
                'admission_date',
                'status',
            )
        }),

        ('Personal Information', {
            'fields': (
                'first_name',
                'last_name',
                'father_name',
                'mother_name',
                'date_of_birth',
                'gender',
            )
        }),

        ('Contact Information', {
            'fields': (
                'email',
                'phone',
                'alternate_phone',
            )
        }),

        ('Address Information', {
            'fields': (
                'address',
                'state',
                'district',
                'city',
                'pincode',
            )
        }),

        ('System Information', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):

        if db_field.name == 'batch':
            kwargs['queryset'] = Batch.objects.filter(status="ACTIVE")

            if request is not None:
                student_id = request.resolver_match.kwargs.get('object_id')

                if student_id:
                    try:
                        student = Student.objects.get(pk=student_id)

                        if student.center_id and student.course_id:
                            kwargs['queryset'] = Batch.objects.filter(
                                center = student.center,
                                course = student.course
                            )

                    except Student.DoesNotExist:
                        pass
                    
        return super().formfield_for_foreignkey(db_field, request, **kwargs)