from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    SuperAdminDashboardView,
    SuperAdminUserViewSet,
)


router = DefaultRouter()

router.register(
    "users",
    SuperAdminUserViewSet,
    basename="superadmin-users",
)


urlpatterns = [
    path(
        "dashboard/",
        SuperAdminDashboardView.as_view(),
        name="superadmin-dashboard",
    ),
    path("", include(router.urls)),
]