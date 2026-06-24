# AI Knowledge & Workflow Assistant

A full-stack SaaS foundation. **Phase 1 = foundation only** (no business/AI features yet).

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · React Hook Form · Zod |
| Backend   | Django 5 · Django REST Framework · SimpleJWT · drf-spectacular · django-filter · django-cors-headers |
| Database  | PostgreSQL |

## Repository layout

```
.
├── backend/    # Django REST API
└── frontend/   # Next.js app
```

## Quick start

### Backend

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit DB credentials
python manage.py migrate
python manage.py runserver
```

- API base:    http://localhost:8000/api/v1/
- Health:      http://localhost:8000/api/v1/health/
- API docs:    http://localhost:8000/api/v1/docs/

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

- App: http://localhost:3000

See `backend/README` notes and inline comments for details.
