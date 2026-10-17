from django.urls import path

from .views import (
    CenterAttendanceListCreateAPIView,
    CenterAttendanceDetailAPIView,
)


urlpatterns = [
    path(
        "center/",
        CenterAttendanceListCreateAPIView.as_view(),
        name="center-attendance-list-create",
    ),
    path(
        "center/<int:pk>/",
        CenterAttendanceDetailAPIView.as_view(),
        name="center-attendance-detail",
    ),
]