# Technical Decisions

## Phase 0 — Project setup

- **Backend:** Django with Django REST Framework. Django provides the server foundation; DRF will support the JSON API.
- **Frontend:** React with Vite and ESLint. Vite provides a quick development server and build tool; ESLint helps catch common code issues.
- **Database:** SQLite for local development to keep setup simple.
- **Secrets:** Store local settings in `backend/.env`; commit only `backend/.env.example`.
- **Background jobs:** Celery with Redis as the planned task queue for email work. Redis is not configured yet.
- **Project layout:** Keep backend and frontend in separate folders so they can be developed and run independently.

## Phase 1 — Backend foundation

- **Custom user:** Extended Django's `AbstractUser` with an approval status and set `AUTH_USER_MODEL` before the first migration.
- **App structure:** Split accounts, flights, and bookings into separate Django apps.
- **Flight status:** Included On-time, Delayed, and Cancelled values to support the planned status and notification features.
- **Booking records:** Added a unique UUID reference and stored the booking total so it can preserve the price at booking time.
- **Seat integrity:** Added a database constraint preventing available seats from exceeding total seats.
- **Admin:** Registered users, flights, and bookings so they can be reviewed in Django Admin.

## Phase 2 — Authentication

- **Registration:** Uses Django password validation and `create_user()` so passwords are hashed and new accounts remain pending.
- **Authentication:** Uses SimpleJWT with a 30-minute access token and 7-day refresh token.
- **Approval gate:** Pending and rejected users receive distinct login errors; only approved users receive tokens.
- **Email:** Approval emails run through a Celery task after the database transaction commits.
- **Local email setup:** Uses the console email backend. Local eager mode runs the task directly because Redis is not installed; Redis-backed background processing still needs to be enabled before final submission.

## Phase 3 — Core APIs

- **Flight search:** Returns future, non-cancelled flights and filters by departure airport, arrival airport, date, and requested seats.
- **Booking:** The server calculates the total, reserves seats inside a transaction with `select_for_update()`, and marks the simulated payment paid.
- **Booking privacy:** Users can only list and retrieve their own bookings.
- **Admin APIs:** User and flight management endpoints require staff permissions; booking stats are aggregated by the backend.
- **Superusers:** New superusers are approved by default so they can use the JWT-protected admin APIs.
- **Database:** SQLite is used locally. For production row-level locking with concurrent bookings, use PostgreSQL, which supports `select_for_update()`.