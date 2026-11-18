# AirBooking

AirBooking is a flight-booking demo built with React and Django REST Framework.

## Features

- Account registration with admin approval
- JWT authentication
- Flight search and details
- AirLabs live flight-status lookup
- Flight booking with seat availability checks
- My Trips and booking cancellation
- Admin tools for users, flights, and booking statistics
- Email notifications for account approval and flight-status changes

**Payments are simulated.** The project does not charge a real payment method.

## Screenshots

Screenshots are in `docs/screenshots/`.

1. Registration pending approval  
   ![Registration pending approval](docs/screenshots/01-registration-pending.png)

2. Admin approves an account  
   ![Admin account approval](docs/screenshots/02-admin-approval.png)

3. Flight search results  
   ![Flight search](docs/screenshots/03-flight-search.png)

4. Flight details and live status  
   ![Live flight status](docs/screenshots/04-live-flight-status.png)

5. Booking confirmation  
   ![Booking confirmation](docs/screenshots/05-booking-confirmation.png)

6. My Trips  
   ![My Trips](docs/screenshots/06-my-trips.png)

7. Cancelled booking  
   ![Cancelled booking](docs/screenshots/07-cancelled-booking.png)

8. Admin dashboard  
   ![Admin dashboard](docs/screenshots/08-admin-dashboard.png)

If your screenshots have different names, update the paths above to match.

## Demo video

[Watch the AirBooking demo](docs/demo-video.mp4)

The video demonstrates the main booking flow and admin features.

## Technology

- Python 3.11
- Django and Django REST Framework
- SimpleJWT for token-based authentication
- Celery for background tasks
- SQLite for local development
- React, Vite, React Router, and Axios
- AirLabs API for flight-status lookup

## Requirements

- Python 3.11
- Node.js and npm
- Git

## Local setup

### 1. Configure the backend

Create `backend/.env` using `backend/.env.example` as a guide. Set your own private values:

```env
SECRET_KEY=your-private-django-secret
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CELERY_TASK_ALWAYS_EAGER=True
AIRLABS_API_KEY=your-private-airlabs-key
```

Keep the real credentials in `backend/.env` only. Do not commit that file. For local development, Celery eager mode runs tasks immediately, so Redis is not required.

### 2. Install backend packages and prepare the database

Run these commands from the project root in PowerShell:

```powershell
py -3.11 -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\backend\.venv\Scripts\python.exe backend\src\manage.py migrate
```

Create an administrator account if needed:

```powershell
.\backend\.venv\Scripts\python.exe backend\src\manage.py createsuperuser
```

### 3. Start the backend

From the project root:

```powershell
.\backend\.venv\Scripts\python.exe backend\src\manage.py runserver
```

The API is available at `http://127.0.0.1:8000/`. Django Admin is at `http://127.0.0.1:8000/admin/`.

### 4. Install and start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address Vite prints. If its port changes, make sure that exact address is included in Django’s `CORS_ALLOWED_ORIGINS` setting.

## Checks

From the project root:

```powershell
.\backend\.venv\Scripts\python.exe backend\src\manage.py check
```

From the `frontend` folder:

```powershell
npm run lint
npm run build
```

## Additional improvements

Keep only improvements that go beyond the assignment requirements:

- AirLabs flight-status lookup
- Passenger cancellation with seat restoration and simulated refund
- Flight-status email notifications
- Admin dashboard statistics

## Limitations

- Payments are simulated; no real payment provider is connected.
- SQLite is used for local development.
- Local emails appear in the backend terminal.
- AirLabs must have data for the requested flight number for live status to appear.
- Production use requires production database, email, payment, and background-task configuration.