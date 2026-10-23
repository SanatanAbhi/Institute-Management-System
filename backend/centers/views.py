
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Center
from .serializers import CenterSerializer, CenterCreateSerializer
from .permissions import IsSuperAdmin


class CenterListCreateAPIView(ListCreateAPIView):
    queryset = Center.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CenterCreateSerializer
        return CenterSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            # Public center listings remain available.
            return [AllowAny()]

        # Only Super Admins can create centers.
        return [IsAuthenticated(), IsSuperAdmin()]


class CenterDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Center.objects.all()
    serializer_class = CenterSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class CenterViewSet(ModelViewSet):
    queryset = Center.objects.all().order_by("-created_at")
    lookup_field = "id"
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return CenterCreateSerializer
        return CenterSerializer
