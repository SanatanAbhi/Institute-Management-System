from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from .models import Application
from .serializers import ApplicationCreateSerializer


class PublicApplicationCreateAPIView(CreateAPIView):
    """
    Public endpoint for submitting an institute application.

    Only application creation is exposed through this endpoint.
    Public users cannot list, edit, or delete applications.
    """

    queryset = Application.objects.all()
    serializer_class = ApplicationCreateSerializer
    permission_classes = [AllowAny]