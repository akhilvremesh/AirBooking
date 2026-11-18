from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from bookings.models import Booking
from .models import Flight


@shared_task
def send_flight_status_notification(flight_id, old_status, new_status):
    try:
        flight = Flight.objects.get(pk=flight_id)
    except Flight.DoesNotExist:
        return "Flight not found"

    bookings = (
        Booking.objects
        .filter(
            flight_id=flight_id,
            status=Booking.Status.CONFIRMED,
            payment_status=Booking.PaymentStatus.PAID,
        )
        .select_related("user")
    )

    recipients = {}
    for booking in bookings:
        email = booking.user.email.strip()
        if email:
            recipients[email] = booking.user.first_name or booking.user.username

    if not recipients:
        return "No booked passengers have email addresses"

    status_labels = dict(Flight.Status.choices)
    old_label = status_labels.get(old_status, old_status)
    new_label = status_labels.get(new_status, new_status)

    sent_count = 0
    for email, name in recipients.items():
        send_mail(
            subject=f"Flight status update: {flight.flight_number}",
            message=(
                f"Hi {name},\n\n"
                f"The status of flight {flight.flight_number} "
                f"({flight.departure_airport} to {flight.arrival_airport}) "
                f"changed from {old_label} to {new_label}.\n\n"
                "Please check AirBooking for the latest trip information."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
        sent_count += 1

    return f"Sent {sent_count} flight status email(s)"