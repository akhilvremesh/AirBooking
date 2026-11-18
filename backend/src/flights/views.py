from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Flight
from .serializers import FlightSerializer


class FlightSearchView(ListAPIView):
    serializer_class = FlightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Flight.objects.filter(
            departure_time__gte=timezone.now(),
            available_seats__gt=0,
        ).exclude(status=Flight.Status.CANCELLED)

        params = self.request.query_params
        departure = params.get("departure_airport")
        arrival = params.get("arrival_airport")
        flight_date = params.get("date")
        requested_seats = params.get("seats")

        if departure:
            queryset = queryset.filter(
                departure_airport__icontains=departure.strip()
            )

        if arrival:
            queryset = queryset.filter(
                arrival_airport__icontains=arrival.strip()
            )

        if flight_date:
            parsed_date = parse_date(flight_date)
            if parsed_date is None:
                raise ValidationError(
                    {"date": "Use YYYY-MM-DD format."}
                )
            queryset = queryset.filter(departure_time__date=parsed_date)

        if requested_seats:
            try:
                seat_count = int(requested_seats)
            except ValueError:
                raise ValidationError(
                    {"seats": "Enter a whole number of seats."}
                )

            if seat_count < 1:
                raise ValidationError(
                    {"seats": "You must request at least one seat."}
                )

            queryset = queryset.filter(available_seats__gte=seat_count)

        return queryset.order_by("departure_time")


class FlightDetailView(RetrieveAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAuthenticated]