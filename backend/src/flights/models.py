from django.db import models
from django.db.models import F, Q
from django.core.validators import MinValueValidator


class Flight(models.Model):
    class Status(models.TextChoices):
        ON_TIME = "on_time", "On-time"
        DELAYED = "delayed", "Delayed"
        CANCELLED = "cancelled", "Cancelled"

    flight_number = models.CharField(max_length=20, unique=True)
    departure_airport = models.CharField(max_length=100)
    arrival_airport = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    available_seats = models.PositiveIntegerField(
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ON_TIME,
    )

    class Meta:
        ordering = ["departure_time"]
        constraints = [
            models.CheckConstraint(
                condition=Q(available_seats__lte=F("total_seats")),
                name="available_seats_lte_total_seats",
            ),
        ]

    def __str__(self):
        return (
            f"{self.flight_number}: "
            f"{self.departure_airport} to {self.arrival_airport}"
        )