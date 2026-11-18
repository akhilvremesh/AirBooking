import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function getErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return "Unable to register. Check that the backend is running.";
  }

  if (data.detail) {
    return data.detail;
  }

  return Object.values(data).flat().join(" ");
}

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await register(form);
      setMessage(
        "Registration received. Your account is pending admin approval.",
      );
      setForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
      });
    } catch (registrationError) {
      setError(getErrorMessage(registrationError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>Create your account</h1>
        <p>Register to start booking flights.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={updateField}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={updateField}
            required
          />

          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            autoComplete="given-name"
            value={form.first_name}
            onChange={updateField}
          />

          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            autoComplete="family-name"
            value={form.last_name}
            onChange={updateField}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={updateField}
            required
          />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="form-success" role="status">
              {message}
            </p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Register"}
          </button>
        </form>

        <p>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}