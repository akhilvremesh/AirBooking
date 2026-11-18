from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from flights.models import Flight

from .models import Booking


@transaction.atomic
def create_booking(*, user, flight_id, seats):
    try:
        flight = Flight.objects.select_for_update().get(pk=flight_id)
    except Flight.DoesNotExist:
        raise NotFound("Flight not found.")

    if flight.departure_time <= timezone.now():
        raise ValidationError({"flight_id": "This flight has already departed."})

    if flight.status == Flight.Status.CANCELLED:
        raise ValidationError({"flight_id": "This flight is cancelled."})

    if flight.available_seats < seats:
        raise ValidationError(
            {"seats": "There are not enough seats available."}
        )

    # Reserve seats while holding the database transaction.
    flight.available_seats -= seats
    flight.save(update_fields=["available_seats"])

    booking = Booking.objects.create(
        user=user,
        flight=flight,
        seats=seats,
        total_price=flight.price * seats,
        status=Booking.Status.PENDING,
        payment_status=Booking.PaymentStatus.PENDING,
    )

    # Simulated payment succeeds immediately in this take-home project.
    booking.payment_status = Booking.PaymentStatus.PAID
    booking.status = Booking.Status.CONFIRMED
    booking.save(update_fields=["payment_status", "status"])

    return booking