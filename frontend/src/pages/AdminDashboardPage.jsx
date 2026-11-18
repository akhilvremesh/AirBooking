import { useCallback, useEffect, useState } from "react";

import api from "../api/client";


const EMPTY_FLIGHT = {
  flight_number: "",
  departure_airport: "",
  arrival_airport: "",
  departure_time: "",
  arrival_time: "",
  price: "",
  total_seats: "",
  status: "on_time",
};


const FLIGHT_STATUSES = [
  ["on_time", "On-time"],
  ["delayed", "Delayed"],
  ["cancelled", "Cancelled"],
];


function getErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return "The request failed. Check that the backend is running.";
  }

  if (data.detail) {
    return data.detail;
  }

  return Object.values(data).flat().join(" ");
}


function formatDateTime(value) {
  return new Date(value).toLocaleString();
}


function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0));
}


function toLocalDateTime(value) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}


export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [flightForm, setFlightForm] = useState(EMPTY_FLIGHT);
  const [editingFlightId, setEditingFlightId] = useState(null);
  const [pendingStatuses, setPendingStatuses] = useState({});
  const [busyUserId, setBusyUserId] = useState(null);
  const [busyFlightId, setBusyFlightId] = useState(null);
  const [savingFlight, setSavingFlight] = useState(false);

  const loadDashboard = useCallback(async () => {
    setError("");

    try {
      const [statsResponse, usersResponse, flightsResponse] =
        await Promise.all([
          api.get("/admin/bookings/stats/"),
          api.get("/admin/users/pending/"),
          api.get("/admin/flights/"),
        ]);

      setStats(statsResponse.data);
      setPendingUsers(usersResponse.data);
      setFlights(flightsResponse.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      await loadDashboard();
      if (active) setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  function updateFlightField(event) {
    setFlightForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function startEditingFlight(flight) {
    setEditingFlightId(flight.id);
    setFlightForm({
      flight_number: flight.flight_number,
      departure_airport: flight.departure_airport,
      arrival_airport: flight.arrival_airport,
      departure_time: toLocalDateTime(flight.departure_time),
      arrival_time: toLocalDateTime(flight.arrival_time),
      price: flight.price,
      total_seats: String(flight.total_seats),
      status: flight.status,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFlightForm() {
    setFlightForm(EMPTY_FLIGHT);
    setEditingFlightId(null);
  }

  async function handleFlightSubmit(event) {
    event.preventDefault();
    setSavingFlight(true);
    setError("");
    setMessage("");

    const payload = {
      ...flightForm,
      departure_time: new Date(flightForm.departure_time).toISOString(),
      arrival_time: new Date(flightForm.arrival_time).toISOString(),
      price: Number(flightForm.price).toFixed(2),
      total_seats: Number(flightForm.total_seats),
    };

    try {
      if (editingFlightId) {
        await api.patch(`/admin/flights/${editingFlightId}/`, payload);
        setMessage("Flight details updated.");
      } else {
        await api.post("/admin/flights/", payload);
        setMessage("Flight created.");
      }

      resetFlightForm();
      await loadDashboard();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSavingFlight(false);
    }
  }

  async function handleFlightStatusUpdate(flightId) {
    const flight = flights.find((item) => item.id === flightId);
    const status = pendingStatuses[flightId] || flight?.status;

    if (!status) return;

    setBusyFlightId(flightId);
    setError("");
    setMessage("");

    try {
      await api.put(`/admin/flights/${flightId}/status/`, { status });
      setMessage("Flight status updated.");
      await loadDashboard();
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    } finally {
      setBusyFlightId(null);
    }
  }

  async function handleUserDecision(userId, decision) {
    setBusyUserId(userId);
    setError("");
    setMessage("");

    try {
      await api.post(`/admin/users/${userId}/${decision}/`);
      setMessage(
        decision === "approve"
          ? "Account approved. The activation email task was triggered."
          : "Account rejected.",
      );
      await loadDashboard();
    } catch (decisionError) {
      setError(getErrorMessage(decisionError));
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <main className="page-content admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Admin dashboard</h1>
          <p>Manage approvals, flights, and booking activity.</p>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}

      {loading ? (
        <p>Loading admin dashboard…</p>
      ) : (
        <>
          <section className="summary-grid" aria-label="Platform statistics">
            <article className="summary-card">
              <span>Users</span>
              <strong>{stats?.users ?? 0}</strong>
            </article>
            <article className="summary-card">
              <span>Pending approvals</span>
              <strong>{stats?.pending_users ?? 0}</strong>
            </article>
            <article className="summary-card">
              <span>Flights</span>
              <strong>{stats?.flights ?? 0}</strong>
            </article>
            <article className="summary-card">
              <span>Bookings</span>
              <strong>{stats?.bookings?.total ?? 0}</strong>
            </article>
            <article className="summary-card">
              <span>Paid revenue</span>
              <strong>{formatPrice(stats?.paid_revenue)}</strong>
            </article>
          </section>

          <section className="dashboard-section">
            <h2>Pending user approvals</h2>

            {pendingUsers.length === 0 ? (
              <p>No users are waiting for approval.</p>
            ) : (
              <div className="admin-card-list">
                {pendingUsers.map((pendingUser) => (
                  <article className="admin-card" key={pendingUser.id}>
                    <div>
                      <h3>{pendingUser.username}</h3>
                      <p>{pendingUser.email}</p>
                      <p>
                        Registered: {formatDateTime(pendingUser.date_joined)}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        disabled={busyUserId === pendingUser.id}
                        onClick={() =>
                          handleUserDecision(pendingUser.id, "approve")
                        }
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={busyUserId === pendingUser.id}
                        onClick={() =>
                          handleUserDecision(pendingUser.id, "reject")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <h2>{editingFlightId ? "Edit flight" : "Create a flight"}</h2>

            <form className="admin-flight-form" onSubmit={handleFlightSubmit}>
              <label>
                Flight number
                <input
                  name="flight_number"
                  value={flightForm.flight_number}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Departure airport
                <input
                  name="departure_airport"
                  value={flightForm.departure_airport}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Arrival airport
                <input
                  name="arrival_airport"
                  value={flightForm.arrival_airport}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Departure time
                <input
                  name="departure_time"
                  type="datetime-local"
                  value={flightForm.departure_time}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Arrival time
                <input
                  name="arrival_time"
                  type="datetime-local"
                  value={flightForm.arrival_time}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Price per seat
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={flightForm.price}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Total seats
                <input
                  name="total_seats"
                  type="number"
                  min="1"
                  value={flightForm.total_seats}
                  onChange={updateFlightField}
                  required
                />
              </label>

              <label>
                Flight status
                <select
                  name="status"
                  value={flightForm.status}
                  onChange={updateFlightField}
                >
                  {FLIGHT_STATUSES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-actions">
                <button type="submit" disabled={savingFlight}>
                  {savingFlight
                    ? "Saving…"
                    : editingFlightId
                      ? "Save changes"
                      : "Create flight"}
                </button>

                {editingFlightId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetFlightForm}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="dashboard-section">
            <h2>Manage flights</h2>

            {flights.length === 0 ? (
              <p>No flights have been created yet.</p>
            ) : (
              <div className="admin-card-list">
                {flights.map((flight) => (
                  <article className="admin-card flight-admin-card" key={flight.id}>
                    <div>
                      <h3>{flight.flight_number}</h3>
                      <p>
                        {flight.departure_airport} → {flight.arrival_airport}
                      </p>
                      <p>Departs: {formatDateTime(flight.departure_time)}</p>
                      <p>
                        {flight.available_seats} of {flight.total_seats} seats
                        available · {formatPrice(flight.price)}
                      </p>
                    </div>

                    <div className="admin-actions flight-status-actions">
                      <label>
                        Status
                        <select
                          value={
                            pendingStatuses[flight.id] || flight.status
                          }
                          onChange={(event) =>
                            setPendingStatuses((current) => ({
                              ...current,
                              [flight.id]: event.target.value,
                            }))
                          }
                        >
                          {FLIGHT_STATUSES.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        disabled={busyFlightId === flight.id}
                        onClick={() => handleFlightStatusUpdate(flight.id)}
                      >
                        Update status
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEditingFlight(flight)}
                      >
                        Edit details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}