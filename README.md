# Production-ready Next.js + Directus + Postgres

This repository contains:

- **Frontend:** Next.js in `frontend/` (deploy to **Vercel**)
- **Backend:** Directus (with custom API extension) in `backend/`
- **Database:** PostgreSQL

> Important: **Vercel should host the Next.js frontend only.**
> Directus is a long-running Node.js server and should be deployed to a container host (Railway, Render, Fly.io, DigitalOcean, ECS, etc.).

---

## Project structure

```text
.
├── frontend/                # Next.js app
├── backend/                 # Directus app + custom endpoint extension
├── docker-compose.yml       # Local development stack (hot reload)
├── docker-compose.prod.yml  # Production-like stack
└── .env.example             # Root env for production compose
```

---

## Local development

### 1) Start Directus + database

```bash
docker compose up --build
```

- Directus: `http://localhost:8055`
- Postgres: `localhost:5432`
- Health check: `GET http://localhost:8055/api/health`

### 2) Start frontend

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

---

## Production backend deployment (Docker)

### 1) Prepare environment files

```bash
cp .env.example .env
cp backend/.env.production.example backend/.env.production
```

Update these values before deploying:

- `POSTGRES_PASSWORD` in root `.env`
- all Directus secrets in `backend/.env.production` (`KEY`, `SECRET`, `ADMIN_*`)
- `PUBLIC_URL` in `backend/.env.production` (your backend URL)
- `CORS_ORIGIN` in `backend/.env.production` (your Vercel frontend URL)

### 2) Run production stack

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This uses:

- multi-stage production build (`backend/Dockerfile`, `target: production`)
- Directus `npm run start`
- persistent Postgres volume

### Deploy backend to Railway (backend only)

This repo includes `railway.json` configured for **backend-only** deployment.

- builder: `DOCKERFILE`
- Dockerfile path: `Dockerfile.backend` (root-level, copies only `backend/`)
- health check: `GET /server/health`

In Railway:

1. Create/import a service from this repository.
2. Keep root directory at repo root (default).
3. Add a PostgreSQL service or external Postgres and set backend env vars:
   - `DB_CLIENT=pg`
   - `DB_CONNECTION_STRING` (recommended, for Railway references use `${{Postgres.DATABASE_URL}}`)
   - If `DB_CONNECTION_STRING` is not set, define `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`
   - `HOST=0.0.0.0`
   - `PORT` is injected by Railway (do not hardcode it)
   - `PUBLIC_URL=https://<your-railway-domain>`
   - `CORS_ORIGIN=https://<your-vercel-domain>`
   - `KEY`, `SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - optional one-time seed toggle: `RESET_AND_SEED_ON_BOOT=true`
4. Deploy. Railway should now create a Docker build plan from `Dockerfile.backend` without scanning frontend files.

---

## Deploy frontend to Vercel

### Option A: Vercel UI (recommended)

1. Import repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set environment variables:
   - `DIRECTUS_URL=https://your-backend-domain`
   - `DIRECTUS_ACCESS_TOKEN=your-directus-access-token`
   - `NEXT_PUBLIC_DIRECTUS_URL=https://your-backend-domain`
4. Deploy.

### Option B: Vercel CLI

```bash
npx vercel --cwd frontend
npx vercel --prod --cwd frontend
```

---

## Production checklist

- [ ] Backend readiness endpoint responds at `https://your-backend-domain/server/health`
- [ ] Custom API health endpoint responds at `https://your-backend-domain/api/health`
- [ ] `CORS_ORIGIN` includes your Vercel domain
- [ ] Frontend env vars in Vercel include Directus URL
- [ ] Directus secrets are rotated from template values
- [ ] Postgres data is persisted and backed up
