from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    GenericAPIView,
    ListCreateAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .admin_serializers import (
    AdminFlightSerializer,
    FlightStatusUpdateSerializer,
)
from .models import Flight
from .tasks import send_flight_status_notification


def _queue_status_email(flight_id, old_status, new_status):
    args = (flight_id, old_status, new_status)

    if settings.CELERY_TASK_ALWAYS_EAGER:
        send_flight_status_notification.apply(args=args, throw=True)
    else:
        send_flight_status_notification.delay(*args)


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

        old_status = flight.status
        new_status = serializer.validated_data["status"]

        with transaction.atomic():
            flight.status = new_status
            flight.save(update_fields=["status"])

            if old_status != new_status:
                transaction.on_commit(
                    lambda: _queue_status_email(
                        flight.pk,
                        old_status,
                        new_status,
                    )
                )

        return Response(AdminFlightSerializer(flight).data)