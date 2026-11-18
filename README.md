# AirBooking

AirBooking is a flight-booking demo with a React frontend and a Django REST API.

## Features

- Account registration with admin approval
- JWT sign-in
- Flight search and booking
- Passenger trip history and booking cancellation
- Admin flight and account management
- Flight status lookup through AirLabs
- Email notifications printed in the backend terminal during local development

Payments are simulated. The app does not charge a real payment method.

## Requirements

- Python 3.11
- Node.js and npm
- Git

Redis is not required for local development when Celery eager mode is enabled.

## Backend setup

From the project root, create `backend/.env` using `backend/.env.example` as a guide. Set a private Django `SECRET_KEY`, your AirLabs `AIRLABS_API_KEY`, and:

```env
CELERY_TASK_ALWAYS_EAGER=True
```

Keep real credentials in `backend/.env` only. Do not commit that file.

Install backend packages and prepare the database:

```powershell
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\backend\.venv\Scripts\python.exe backend\src\manage.py migrate
```

Create an administrator if needed:

```powershell
.\backend\.venv\Scripts\python.exe backend\src\manage.py createsuperuser
```

Start Django from the project root:

```powershell
.\backend\.venv\Scripts\python.exe backend\src\manage.py runserver
```

The API runs at `http://127.0.0.1:8000/`. Django Admin is at `http://127.0.0.1:8000/admin/`.

## Frontend setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address Vite prints. If the address uses a port that is not listed in Django’s `CORS_ALLOWED_ORIGINS` setting, add that exact frontend origin and restart Django.

## Useful checks

From the project root:

```powershell
.\backend\.venv\Scripts\python.exe backend\src\manage.py check
```

From the `frontend` folder:

```powershell
npm run lint
npm run build
```

## Notes

- The local database is SQLite.
- Local email messages appear in the Django terminal.
- AirLabs keys must remain on the backend and must never be added to frontend code.
- The live-status feature depends on AirLabs having data for the requested flight.
- Production use requires production-ready hosting, database, email, payment, and background-job configuration.