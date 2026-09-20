from django import forms
from .models import Student
from batches.models import Batch

class StudentForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['batch'].queryset = Batch.objects.none()

        if self.instance.pk:

            if 'center' in self.data and 'course' in self.data:
                try:
                    center_id = int(self.data.get('center'))
                    course_id = int(self.data.get('course'))

                    self.fields['batch'].queryset = Batch.objects.filter(
                        center_id = center_id,
                        course_id = course_id
                    )

                except (ValueError, TypeError):
                    pass

            self.fields['batch'].queryset = Batch.objects.filter(
                center = self.instance.center,
                course = self.instance.course
            )

    class Meta:
        model = Student
        fields = '__all__'