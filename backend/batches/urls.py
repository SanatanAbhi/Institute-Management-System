from django.urls import path
from .views import BatchDetailAPIView, BatchListAPIView

urlpatterns = [
    path("", BatchListAPIView.as_view(), name="batch-list-create"),
    path("<int:pk>/", BatchDetailAPIView.as_view(), name="batch-detail"),
]
