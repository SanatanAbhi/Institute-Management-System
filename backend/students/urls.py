from django.urls import path
from .views import student_profile, student_dashboard, student_courses, student_attendance, student_fees, student_marksheet, student_certificate, download_certificate

urlpatterns = [
    path("profile/", student_profile),
    path("dashboard/", student_dashboard),
    path("courses/", student_courses),
    path("attendance/", student_attendance),
    path("fees/", student_fees),
    path("marksheet/", student_marksheet),
    path("certificate/", student_certificate),
    path("certificate/download/", download_certificate)
]