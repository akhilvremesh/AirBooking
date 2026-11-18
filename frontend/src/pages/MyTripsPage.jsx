import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client";


function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}


function formatDateTime(value) {
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


export default function MyTripsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/bookings/");
        if (active) setBookings(data);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, []);

  async function handleCancel(booking) {
    const confirmed = window.confirm(
      "Cancel this booking? The demo payment will be marked refunded and the seats released.",
    );

    if (!confirmed) return;

    setCancelError("");
    setCancellingId(booking.id);

    try {
      const { data } = await api.post(`/bookings/${booking.id}/cancel/`);
      setBookings((currentBookings) =>
        currentBookings.map((item) =>
          item.id === booking.id ? data : item,
        ),
      );
    } catch (cancelRequestError) {
      setCancelError(getErrorMessage(cancelRequestError));
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <main className="page-content"><p>Loading your trips…</p></main>;
  }

  return (
    <main className="page-content">
      <h1>My Trips</h1>
      <p>Your bookings and current flight statuses.</p>

      {error && <p className="form-error" role="alert">{error}</p>}
      {cancelError && (
        <p className="form-error" role="alert">{cancelError}</p>
      )}

      {!error && bookings.length === 0 && (
        <section>
          <p>You don’t have any bookings yet.</p>
          <Link to="/flights">Search flights</Link>
        </section>
      )}

      <section className="trip-list" aria-label="Your bookings">
        {bookings.map((booking) => (
          <article className="trip-card" key={booking.id}>
            <div>
              <p className="flight-number">
                {booking.flight.flight_number}
              </p>
              <h2>
                {booking.flight.departure_airport} →{" "}
                {booking.flight.arrival_airport}
              </h2>
              <p>
                Departs: {formatDateTime(booking.flight.departure_time)}
              </p>
              <p>
                Flight status: {booking.flight.status.replace("_", "-")}
              </p>
            </div>

            <div className="trip-booking-details">
              <p>Booking reference: {booking.reference}</p>
              <p>Seats: {booking.seats}</p>
              <p>Booking: {booking.status}</p>
              <p>Payment: {booking.payment_status}</p>
              <strong>{formatPrice(booking.total_price)}</strong>

              {booking.status === "confirmed" && (
                <button
                  type="button"
                  onClick={() => handleCancel(booking)}
                  disabled={cancellingId === booking.id}
                >
                  {cancellingId === booking.id
                    ? "Cancelling…"
                    : "Cancel booking"}
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}