import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/client";


function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}


function formatDateTime(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}


function getErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return "Unable to complete the request. Please try again.";
  }

  if (data.detail) {
    return data.detail;
  }

  return Object.values(data).flat().join(" ");
}


export default function FlightDetailPage() {
  const { id } = useParams();

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [statusInProgress, setStatusInProgress] = useState(false);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFlight() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/flights/${id}/`);
        if (active) setFlight(data);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFlight();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleBooking(event) {
    event.preventDefault();
    setError("");
    setBookingInProgress(true);

    try {
      const { data } = await api.post("/bookings/", {
        flight_id: flight.id,
        seats: Number(seats),
      });
      setBooking(data);
    } catch (bookingError) {
      setError(getErrorMessage(bookingError));
    } finally {
      setBookingInProgress(false);
    }
  }

  async function handleLiveStatus() {
    setStatusError("");
    setStatusInProgress(true);

    try {
      const { data } = await api.get(`/flights/${id}/live-status/`);
      setLiveStatus(data);
    } catch (statusRequestError) {
      setStatusError(getErrorMessage(statusRequestError));
    } finally {
      setStatusInProgress(false);
    }
  }

  if (loading) {
    return <main className="page-content"><p>Loading flight…</p></main>;
  }

  if (error && !flight) {
    return (
      <main className="page-content">
        <p className="form-error" role="alert">{error}</p>
        <Link to="/flights">Back to search</Link>
      </main>
    );
  }

  if (!flight) return null;

  if (booking) {
    return (
      <main className="page-content">
        <section className="booking-confirmation">
          <h1>Booking confirmed</h1>
          <p>Your demo payment was simulated successfully.</p>
          <dl>
            <dt>Booking reference</dt>
            <dd>{booking.reference}</dd>
            <dt>Flight</dt>
            <dd>{flight.flight_number}</dd>
            <dt>Seats</dt>
            <dd>{booking.seats}</dd>
            <dt>Total paid</dt>
            <dd>{formatPrice(booking.total_price)}</dd>
            <dt>Payment status</dt>
            <dd>{booking.payment_status}</dd>
          </dl>
          <Link to="/trips">View My Trips</Link>
        </section>
      </main>
    );
  }

  const canBook =
    flight.status !== "cancelled" && flight.available_seats > 0;

  return (
    <main className="page-content">
      <Link to="/flights">← Back to search</Link>

      <section className="flight-detail-card">
        <h1>{flight.flight_number}</h1>
        <p>
          {flight.departure_airport} → {flight.arrival_airport}
        </p>
        <p>Departs: {formatDateTime(flight.departure_time)}</p>
        <p>Arrives: {formatDateTime(flight.arrival_time)}</p>
        <p>Status: {flight.status.replace("_", "-")}</p>
        <p>{flight.available_seats} seats available</p>
        <p>Price per seat: {formatPrice(flight.price)}</p>

        <section className="live-status">
          <button
            type="button"
            onClick={handleLiveStatus}
            disabled={statusInProgress}
          >
            {statusInProgress ? "Checking AirLabs…" : "Check live status"}
          </button>

          {statusError && (
            <p className="form-error" role="alert">{statusError}</p>
          )}

          {liveStatus && (
            <div>
              <h2>Live status from {liveStatus.source}</h2>
              <p>Status: {liveStatus.status}</p>
              <p>
                Delay: {liveStatus.delay_minutes ?? "Not available"} minutes
              </p>
              <p>
                Live departure:{" "}
                {formatDateTime(liveStatus.departure_time_utc)}
              </p>
              <p>
                Live arrival: {formatDateTime(liveStatus.arrival_time_utc)}
              </p>
            </div>
          )}
        </section>

        {error && <p className="form-error" role="alert">{error}</p>}

        {canBook ? (
          <form className="booking-form" onSubmit={handleBooking}>
            <label htmlFor="seats">Seats to book</label>
            <input
              id="seats"
              type="number"
              min="1"
              max={flight.available_seats}
              value={seats}
              onChange={(event) => setSeats(event.target.value)}
              required
            />

            <p>
              Total: {formatPrice(Number(flight.price) * Number(seats))}
            </p>

            <button type="submit" disabled={bookingInProgress}>
              {bookingInProgress
                ? "Processing demo payment…"
                : "Confirm and pay (demo)"}
            </button>
            <p className="muted">
              This is a simulated payment. No real charge will be made.
            </p>
          </form>
        ) : (
          <p>This flight is unavailable for booking.</p>
        )}
      </section>
    </main>
  );
}