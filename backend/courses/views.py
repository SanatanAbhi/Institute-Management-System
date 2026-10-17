from rest_framework.generics import ListAPIView

from .models import Course
from rest_framework import serializers


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "course_code",
            "course_name",
            "duration",
            "fee",
            "status",
        ]


class CourseListAPIView(ListAPIView):
    queryset = Course.objects.filter(status="ACTIVE").order_by(
        "course_name"
    )
    serializer_class = CourseSerializer