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

    # Payment succeeds immediately in this demo.
    booking.payment_status = Booking.PaymentStatus.PAID
    booking.status = Booking.Status.CONFIRMED
    booking.save(update_fields=["payment_status", "status"])

    return booking


@transaction.atomic
def cancel_booking(*, user, booking_id):
    try:
        booking_reference = Booking.objects.only("flight_id").get(
            pk=booking_id,
            user=user,
        )
    except Booking.DoesNotExist:
        raise NotFound("Booking not found.")

    try:
        flight = Flight.objects.select_for_update().get(
            pk=booking_reference.flight_id
        )
    except Flight.DoesNotExist:
        raise NotFound("Flight not found.")

    try:
        booking = Booking.objects.select_for_update().get(
            pk=booking_id,
            user=user,
        )
    except Booking.DoesNotExist:
        raise NotFound("Booking not found.")

    if booking.status != Booking.Status.CONFIRMED:
        raise ValidationError(
            {"booking": "Only confirmed bookings can be cancelled."}
        )

    if flight.departure_time <= timezone.now():
        raise ValidationError(
            {"booking": "A booking cannot be cancelled after departure."}
        )

    booking.status = Booking.Status.CANCELLED
    booking.payment_status = Booking.PaymentStatus.REFUNDED
    booking.save(update_fields=["status", "payment_status"])

    flight.available_seats += booking.seats
    flight.save(update_fields=["available_seats"])

    return booking