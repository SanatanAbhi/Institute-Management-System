from django.shortcuts import render
from rest_framework.generics import ListAPIView
from .models import Batch
from .serializers import BatchSerializer

# Create your views here.

class BatchListAPIView(ListAPIView):
    serializer_class = BatchSerializer

    def get_queryset(self):
        queryset = Batch.objects.all()

        center = self.request.query_params.get("center")
        course = self.request.query_params.get("course")

        if center and course:
            queryset = queryset.filter(
                center_id = center,
                course_id = course
            )

        return queryset