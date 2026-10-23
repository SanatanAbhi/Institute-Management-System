from django.urls import path
from .views import CourseDetailAPIView, CourseListAPIView

urlpatterns = [
    path("", CourseListAPIView.as_view(), name="course-list-create"),
    path("<int:pk>/", CourseDetailAPIView.as_view(), name="course-detail"),
]
