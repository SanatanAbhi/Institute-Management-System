from django.urls import path

from .views import PublicApplicationCreateAPIView


urlpatterns = [
    path(
        "",
        PublicApplicationCreateAPIView.as_view(),
        name="public-application-create",
    ),
]