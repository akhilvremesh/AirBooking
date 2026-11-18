import { useState } from "react";
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


export default function FlightSearchPage() {
  const [filters, setFilters] = useState({
    departure_airport: "",
    arrival_airport: "",
    date: "",
    seats: "1",
  });
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const { data } = await api.get("/flights/search/", {
        params: {
          departure_airport: filters.departure_airport.trim(),
          arrival_airport: filters.arrival_airport.trim(),
          date: filters.date,
          seats: filters.seats,
        },
      });

      setFlights(data);
    } catch (searchError) {
      setFlights([]);
      setError(
        searchError.response?.data?.detail ||
          "Unable to search flights. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-content">
      <h1>Find your flight</h1>
      <p>Search upcoming flights by airport, travel date, and seats.</p>

      <form className="search-form" onSubmit={handleSearch}>
        <label>
          From
          <input
            name="departure_airport"
            value={filters.departure_airport}
            onChange={updateField}
            placeholder="e.g. DEL"
            required
          />
        </label>

        <label>
          To
          <input
            name="arrival_airport"
            value={filters.arrival_airport}
            onChange={updateField}
            placeholder="e.g. BOM"
            required
          />
        </label>

        <label>
          Travel date
          <input
            name="date"
            type="date"
            value={filters.date}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Seats
          <input
            name="seats"
            type="number"
            min="1"
            value={filters.seats}
            onChange={updateField}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search flights"}
        </button>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}

      {loading && <p role="status">Loading flights…</p>}

      {!loading && searched && flights.length === 0 && !error && (
        <p>No available flights matched those filters.</p>
      )}

      <section className="flight-results" aria-label="Flight results">
        {flights.map((flight) => (
          <article className="flight-card" key={flight.id}>
            <div>
              <p className="flight-number">{flight.flight_number}</p>
              <p>
                {flight.departure_airport} → {flight.arrival_airport}
              </p>
              <p>
                {formatDateTime(flight.departure_time)} –{" "}
                {formatDateTime(flight.arrival_time)}
              </p>
              <p>{flight.available_seats} seats available</p>
            </div>

            <div className="flight-card-action">
              <span className={`status-badge status-${flight.status}`}>
                {flight.status.replace("_", "-")}
              </span>
              <strong>{formatPrice(flight.price)}</strong>
              <Link to={`/flights/${flight.id}`}>View details</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}