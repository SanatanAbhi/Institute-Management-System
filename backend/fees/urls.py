from django.urls import path

from .views import (
    CenterFeeListCreateAPIView,
    CenterFeeDetailAPIView,
)


urlpatterns = [
    path(
        "center/",
        CenterFeeListCreateAPIView.as_view(),
        name="center-fee-list-create",
    ),
    path(
        "center/<int:pk>/",
        CenterFeeDetailAPIView.as_view(),
        name="center-fee-detail",
    ),
]