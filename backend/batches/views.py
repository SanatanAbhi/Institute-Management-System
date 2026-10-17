from rest_framework.generics import ListAPIView

from .models import Batch
from .serializers import BatchSerializer


class BatchListAPIView(ListAPIView):
    serializer_class = BatchSerializer

    def get_queryset(self):
        queryset = Batch.objects.filter(
            status__in=["UPCOMING", "ACTIVE"]
        ).order_by("start_date")

        center = self.request.query_params.get("center")
        course = self.request.query_params.get("course")

        if center:
            queryset = queryset.filter(center_id=center)

        if course:
            queryset = queryset.filter(course_id=course)

        return queryset