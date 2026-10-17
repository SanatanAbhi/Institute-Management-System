from django.urls import path

from .views import (
    CenterCertificateListCreateAPIView,
    CenterCertificateDetailAPIView,
)


urlpatterns = [
    path(
        "center/",
        CenterCertificateListCreateAPIView.as_view(),
        name="center-certificate-list-create",
    ),
    path(
        "center/<int:pk>/",
        CenterCertificateDetailAPIView.as_view(),
        name="center-certificate-detail",
    ),
]