from django.urls import path

from .views import (
    CenterResultListCreateAPIView,
    CenterResultDetailAPIView,
)


urlpatterns = [
    path(
        "center/",
        CenterResultListCreateAPIView.as_view(),
        name="center-result-list-create",
    ),
    path(
        "center/<int:pk>/",
        CenterResultDetailAPIView.as_view(),
        name="center-result-detail",
    ),
]