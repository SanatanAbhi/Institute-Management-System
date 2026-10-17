from django.urls import path

from .views import (
    CenterAdmissionListCreateAPIView,
    CenterAdmissionDetailAPIView,
)


urlpatterns = [
    path(
        "center/",
        CenterAdmissionListCreateAPIView.as_view(),
        name="center-admission-list-create",
    ),

    path(
        "center/<int:pk>/",
        CenterAdmissionDetailAPIView.as_view(),
        name="center-admission-detail",
    ),
]