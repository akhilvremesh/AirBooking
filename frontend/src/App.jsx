import { Link, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/useAuth";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FlightDetailPage from "./pages/FlightDetailPage";
import FlightSearchPage from "./pages/FlightSearchPage";
import LoginPage from "./pages/LoginPage";
import MyTripsPage from "./pages/MyTripsPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import "./App.css";


function HomeRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <p className="page-message">Loading AirBooking…</p>;
  }

  const destination = isAuthenticated
    ? isAdmin
      ? "/admin"
      : "/dashboard"
    : "/login";

  return <Navigate to={destination} replace />;
}


export default function App() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          AirBooking
        </Link>

        <nav aria-label="Main navigation">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/flights">Search flights</Link>
              <Link to="/trips">My Trips</Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <span className="nav-username">{user?.username}</span>
              <button type="button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/flights" element={<FlightSearchPage />} />
          <Route path="/flights/:id" element={<FlightDetailPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}