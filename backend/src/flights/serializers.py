from rest_framework import serializers

from .models import Flight


class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = (
            "id",
            "flight_number",
            "departure_airport",
            "arrival_airport",
            "departure_time",
            "arrival_time",
            "price",
            "total_seats",
            "available_seats",
            "status",
        )
        read_only_fields = fields