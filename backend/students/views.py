from django.shortcuts import render
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from .permissions import IsCenterOwner
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Create your views here.

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_profile(request):

    user = request.user

    data = {
        "name": user.get_full_name() or user.username,
        "username": user.username,
        "role": user.role,
    }

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_dashboard(request):

    data = {
        "total_courses": 3,
        "total_batches": 2,
        "attendance_percentage": 92,
        "total_certificates": 1,
    }

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_courses(request):

    courses = [
        {
            "id": 1,
            "course_name": "Python Programming",
            "duration": "2 Months",
            "status": "Active",
            "progress": 70,
        },
        {
            "id": 2,
            "course_name": "Django Framework",
            "duration": "1 Month",
            "status": "Active",
            "progress": 40,
        },
        {
            "id": 3,
            "course_name": "React.js",
            "duration": "1 Month",
            "status": "Completed",
            "progress": 100,
        },
    ]

    return Response(courses)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_attendance(request):

    attendance = [
        {
            "id": 1,
            "date": "20 Sep 2026",
            "subject": "Python Programming",
            "status": "Present"
        },
        {
            "id": 2,
            "date": "19 Sep 2026",
            "subject": "Django Framework",
            "status": "Present"
        },
        {
            "id": 3,
            "date": "18 Sep 2026",
            "subject": "React.js",
            "status": "Absent"
        },
        {
            "id": 4,
            "date": "17 Sep 2026",
            "subject": "Git & GitHub",
            "status": "Present"
        },
    ]

    return Response({
        "attendance_percentage": 75,
        "records": attendance
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_fees(request):

    payment_history = [
        {
            "id": 1,
            "date": "15 Sep 2026",
            "amount": 10000,
            "mode": "UPI",
            "status": "Success"
        },
        {
            "id": 2,
            "date": "01 Sep 2026",
            "amount": 10000,
            "mode": "Cash",
            "status": "Success"
        }
    ]

    return Response({
        "total_fee": 35000,
        "paid_amount": 20000,
        "pending_amount": 15000,
        "history": payment_history
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_marksheet(request):

    subjects = [
        {"id": 1, "subject": "Python Programming", "marks": 92},
        {"id": 2, "subject": "Django Framework", "marks": 88},
        {"id": 3, "subject": "React.js", "marks": 90},
        {"id": 4, "subject": "Git & GitHub", "marks": 95},
    ]

    return Response({
        "exam_name": "Python Full Stack Final Exam",
        "total_marks": 400,
        "obtained_marks": 365,
        "percentage": 91.25,
        "grade": "A+",
        "subjects": subjects
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_certificate(request):

    user = request.user

    return Response({
        "certificate_id": "IMS-2026-0001",
        "student_name": user.get_full_name() or user.username,
        "course_name": "Python Full Stack Developer",
        "completion_date": "21 September 2026",
        "grade": "A+",
        "status": "Issued"
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_certificate(request):

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="certificate.pdf"'

    pdf = canvas.Canvas(response)

    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawCentredString(300, 760, "Institute Management System")

    pdf.setFont("Helvetica", 18)
    pdf.drawCentredString(300, 700, "Course Completion Certificate")

    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(
        300,
        650,
        f"Presented To: {request.user.username}"
    )

    pdf.drawCentredString(
        300,
        620,
        "Python Full Stack Developer"
    )

    pdf.drawCentredString(
        300,
        590,
        "Completion Date: 21 September 2026"
    )

    pdf.save()

    return response