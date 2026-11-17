# Technical Decisions

## Phase 0 — Project setup

- **Backend:** Django with Django REST Framework. Django provides the server foundation; DRF will support the JSON API.
- **Frontend:** React with Vite and ESLint. Vite provides a quick development server and build tool; ESLint helps catch common code issues.
- **Database:** SQLite for local development to keep setup simple.
- **Secrets:** Store local settings in `backend/.env`; commit only `backend/.env.example`.
- **Background jobs:** Celery with Redis as the planned task queue for email work. Redis is not configured yet.
- **Project layout:** Keep backend and frontend in separate folders so they can be developed and run independently.