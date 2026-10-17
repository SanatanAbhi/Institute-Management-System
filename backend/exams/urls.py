from django.urls import path

from .views import (
    CenterExamListCreateAPIView,
    CenterExamDetailAPIView,
)


urlpatterns = [
    path(
        "center/",
        CenterExamListCreateAPIView.as_view(),
        name="center-exam-list-create",
    ),
    path(
        "center/<int:pk>/",
        CenterExamDetailAPIView.as_view(),
        name="center-exam-detail",
    ),
]