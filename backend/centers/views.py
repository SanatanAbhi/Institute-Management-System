from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Center
from .serializers import CenterSerializer
from .permissions import IsSuperAdmin


class CenterListCreateAPIView(ListCreateAPIView):

    queryset = Center.objects.all()
    serializer_class = CenterSerializer


class CenterDetailAPIView(RetrieveUpdateDestroyAPIView):

    queryset = Center.objects.all()
    serializer_class = CenterSerializer
    lookup_field = "id"


class CenterViewSet(ModelViewSet):

    queryset = Center.objects.all()
    serializer_class = CenterSerializer
    lookup_field = "id"


class CenterListCreateAPIView(ListCreateAPIView):

    queryset = Center.objects.all()
    serializer_class = CenterSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):

        if self.request.method == "GET":
            return [IsAuthenticated()]

        if self.request.method == "POST":
            return [IsSuperAdmin()]

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsSuperAdmin()]

        return [IsAuthenticated()]