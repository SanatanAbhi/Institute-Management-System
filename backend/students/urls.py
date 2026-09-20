from django.urls import path
from .views import student_profile, student_dashboard

urlpatterns = [
    path("profile/", student_profile),
    path("dashboard/", student_dashboard),
]