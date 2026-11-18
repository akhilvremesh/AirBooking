from rest_framework import serializers

from .models import Flight


class AdminFlightSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
    )
    available_seats = serializers.IntegerField(
        min_value=0,
        required=False,
    )

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
        read_only_fields = ("id",)

    def validate(self, attrs):
        total_seats = attrs.get(
            "total_seats",
            self.instance.total_seats if self.instance else None,
        )
        available_seats = attrs.get(
            "available_seats",
            self.instance.available_seats if self.instance else None,
        )

        if self.instance:
            reserved_seats = (
                self.instance.total_seats - self.instance.available_seats
            )

            if total_seats < reserved_seats:
                raise serializers.ValidationError(
                    {
                        "total_seats": (
                            "Capacity cannot be lower than seats already reserved."
                        )
                    }
                )

            if (
                "total_seats" in attrs
                and "available_seats" not in attrs
            ):
                available_seats = total_seats - reserved_seats
                attrs["available_seats"] = available_seats

        elif available_seats is None:
            available_seats = total_seats
            attrs["available_seats"] = available_seats

        if available_seats > total_seats:
            raise serializers.ValidationError(
                {"available_seats": "Cannot exceed total seats."}
            )

        departure_time = attrs.get(
            "departure_time",
            self.instance.departure_time if self.instance else None,
        )
        arrival_time = attrs.get(
            "arrival_time",
            self.instance.arrival_time if self.instance else None,
        )

        if departure_time and arrival_time <= departure_time:
            raise serializers.ValidationError(
                {"arrival_time": "Must be later than departure time."}
            )

        return attrs


class FlightStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Flight.Status.choices)
    