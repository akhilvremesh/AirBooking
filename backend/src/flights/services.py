import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework.exceptions import APIException, NotFound


class AirLabsNotConfigured(APIException):
    status_code = 503
    default_detail = "AirLabs API key is not configured."
    default_code = "airlabs_not_configured"


def get_live_flight_status(flight):
    api_key = getattr(settings, "AIRLABS_API_KEY", "").strip()
    if not api_key:
        raise AirLabsNotConfigured()

    params = urlencode({
        "flight_iata": flight.flight_number.strip().upper(),
        "api_key": api_key,
    })
    request = Request(
        f"https://airlabs.co/api/v9/flight?{params}",
        headers={"Accept": "application/json"},
    )

    try:
        with urlopen(request, timeout=12) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        raise APIException("Could not retrieve live flight status from AirLabs.")

    if isinstance(payload, dict) and payload.get("error"):
        raise APIException(
            "AirLabs could not retrieve information for this flight."
        )

    data = payload.get("response", payload) if isinstance(payload, dict) else payload
    if isinstance(data, list):
        data = data[0] if data else None

    if not isinstance(data, dict) or not data.get("flight_iata"):
        raise NotFound("AirLabs has no live information for this flight.")

    def utc_iso(value):
        if not value:
            return None

        value = str(value).strip().replace(" ", "T")
        if not value.endswith("Z") and "+" not in value:
            value += "Z"
        return value

    return {
        "flight_number": data.get("flight_iata", flight.flight_number),
        "status": data.get("status", "unknown"),
        "delay_minutes": data.get("delayed"),
        "departure_time_utc": utc_iso(
            data.get("dep_estimated_utc") or data.get("dep_time_utc")
        ),
        "arrival_time_utc": utc_iso(
            data.get("arr_estimated_utc") or data.get("arr_time_utc")
        ),
        "source": "AirLabs",
    }