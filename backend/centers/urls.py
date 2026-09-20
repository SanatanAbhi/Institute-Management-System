from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CenterListCreateAPIView, CenterDetailAPIView, CenterViewSet

router = DefaultRouter()
router.register('centers-v2', CenterViewSet, basename="centers-v2")

urlpatterns = [
    path("", CenterListCreateAPIView.as_view(), name="center-list-create"),
    path("<int:id>/", CenterDetailAPIView.as_view(), name="center-detail"),

    path("", include(router.urls)),
]