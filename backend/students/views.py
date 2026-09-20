from django.shortcuts import render
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

    print("USER =>", request.user)
    print("AUTH =>", request.headers.get("Authorization"))

    user = request.user

    data = {
        "total_courses": 3,
        "total_batches": 2,
        "attendance_percentage": 92,
        "total_certificates": 1,
    }

    return Response({
        "name": user.username,
        "username": user.username,
        "role": user.role,
    })