from django.shortcuts import get_object_or_404
from rest_framework.generics import GenericAPIView, ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .admin_serializers import (
    AdminFlightSerializer,
    FlightStatusUpdateSerializer,
)
from .models import Flight


class AdminFlightListCreateView(ListCreateAPIView):
    queryset = Flight.objects.all()
    serializer_class = AdminFlightSerializer
    permission_classes = [IsAdminUser]


class AdminFlightDetailView(RetrieveUpdateAPIView):
    queryset = Flight.objects.all()
    serializer_class = AdminFlightSerializer
    permission_classes = [IsAdminUser]


class FlightStatusUpdateView(GenericAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightStatusUpdateSerializer
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        flight = get_object_or_404(self.get_queryset(), pk=pk)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        flight.status = serializer.validated_data["status"]
        flight.save(update_fields=["status"])

        return Response(AdminFlightSerializer(flight).data)