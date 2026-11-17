from django.contrib import admin

from .models import Flight


@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = (
        "flight_number",
        "departure_airport",
        "arrival_airport",
        "departure_time",
        "price",
        "available_seats",
        "status",
    )
    list_filter = ("status", "departure_time")
    search_fields = (
        "flight_number",
        "departure_airport",
        "arrival_airport",
    )