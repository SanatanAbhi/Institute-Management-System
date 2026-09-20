from django.urls import path
from .views import BatchListAPIView

urlpatterns = [
    path('', BatchListAPIView.as_view(), name='batch-list'),
]