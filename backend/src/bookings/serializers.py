from rest_framework import serializers

from flights.serializers import FlightSerializer
from .models import Booking


class BookingCreateSerializer(serializers.Serializer):
    flight_id = serializers.IntegerField(min_value=1)
    seats = serializers.IntegerField(min_value=1)

    def create(self, validated_data):
        from .services import create_booking

        return create_booking(
            user=self.context["request"].user,
            flight_id=validated_data["flight_id"],
            seats=validated_data["seats"],
        )


class BookingSerializer(serializers.ModelSerializer):
    flight = FlightSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id",
            "reference",
            "flight",
            "seats",
            "total_price",
            "status",
            "payment_status",
            "created_at",
        )
        read_only_fields = fields