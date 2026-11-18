import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/useAuth";


function formatDateTime(value) {
  return new Date(value).toLocaleString();
}


export default function UserDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        const { data } = await api.get("/bookings/");
        if (active) {
          setBookings(data);
          setNow(Date.now());
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError.response?.data?.detail ||
              "Unable to load your booking summary.",
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

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed",
  );

  const upcomingBookings = confirmedBookings
    .filter(
      (booking) =>
        new Date(booking.flight.departure_time).getTime() > now,
    )
    .sort(
      (left, right) =>
        new Date(left.flight.departure_time) -
        new Date(right.flight.departure_time),
    )
    .slice(0, 3);

  return (
    <main className="page-content">
      <div className="dashboard-heading">
        <div>
          <h1>Welcome, {user?.first_name || user?.username}</h1>
          <p>Your AirBooking overview.</p>
        </div>
        <Link className="primary-link" to="/flights">
          Search flights
        </Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="summary-grid" aria-label="Booking summary">
        <article className="summary-card">
          <span>Total bookings</span>
          <strong>{loading ? "…" : bookings.length}</strong>
        </article>
        <article className="summary-card">
          <span>Confirmed trips</span>
          <strong>{loading ? "…" : confirmedBookings.length}</strong>
        </article>
        <article className="summary-card">
          <span>Upcoming flights</span>
          <strong>{loading ? "…" : upcomingBookings.length}</strong>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Upcoming flights</h2>
          <Link to="/trips">View all trips</Link>
        </div>

        {loading && <p>Loading your bookings…</p>}

        {!loading && !error && upcomingBookings.length === 0 && (
          <p>You don’t have an upcoming flight yet.</p>
        )}

        <div className="dashboard-trip-list">
          {upcomingBookings.map((booking) => (
            <article className="trip-card" key={booking.id}>
              <div>
                <p className="flight-number">
                  {booking.flight.flight_number}
                </p>
                <h3>
                  {booking.flight.departure_airport} →{" "}
                  {booking.flight.arrival_airport}
                </h3>
                <p>{formatDateTime(booking.flight.departure_time)}</p>
              </div>
              <span className={`status-badge status-${booking.flight.status}`}>
                {booking.flight.status.replace("_", "-")}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}