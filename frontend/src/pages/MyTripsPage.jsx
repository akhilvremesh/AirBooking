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


export default function MyTripsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/bookings/");
        if (active) setBookings(data);
      } catch (loadError) {
        if (active) {
          setError(
            loadError.response?.data?.detail ||
              "Unable to load your trips. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <main className="page-content"><p>Loading your trips…</p></main>;
  }

  return (
    <main className="page-content">
      <h1>My Trips</h1>
      <p>Your bookings and current flight statuses.</p>

      {error && <p className="form-error" role="alert">{error}</p>}

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
                Flight status:{" "}
                {booking.flight.status.replace("_", "-")}
              </p>
            </div>

            <div className="trip-booking-details">
              <p>Booking reference: {booking.reference}</p>
              <p>Seats: {booking.seats}</p>
              <p>Booking: {booking.status}</p>
              <p>Payment: {booking.payment_status}</p>
              <strong>{formatPrice(booking.total_price)}</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}