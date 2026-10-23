from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from accounts.permissions import IsSuperAdmin
from .models import Course
from .serializers import CourseSerializer


class CourseListAPIView(ListCreateAPIView):
    """Public users see active courses; Super Admins manage all courses."""
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all().order_by("course_name")
        user = self.request.user
        if not (user.is_authenticated and getattr(user, "role", None) == "SUPER_ADMIN"):
            queryset = queryset.filter(status="ACTIVE")
        return queryset

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsSuperAdmin()]


class CourseDetailAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]
