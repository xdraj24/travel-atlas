# Production-ready Next.js + Strapi + Postgres

This repository contains:

- **Frontend:** Next.js in `frontend/` (deploy to **Vercel**)
- **Backend:** Strapi in `backend/` (deploy as a Docker container)
- **Database:** PostgreSQL

> Important: **Vercel should host the Next.js frontend only.**
> Strapi is a long-running Node.js server and should be deployed to a container host (Railway, Render, Fly.io, DigitalOcean, ECS, etc.).

---

## Project structure

```text
.
├── frontend/                # Next.js app
├── backend/                 # Strapi app
├── docker-compose.yml       # Local development stack (hot reload)
├── docker-compose.prod.yml  # Production-like stack
└── .env.example             # Root env for production compose
```

---

## Local development

### 1) Start backend + database

```bash
docker compose up --build
```

- Strapi: `http://localhost:1337`
- Postgres: `localhost:5432`
- Health check: `GET http://localhost:1337/api/health`

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
- all Strapi secrets in `backend/.env.production` (`APP_KEYS`, `JWT_SECRET`, etc.)
- `PUBLIC_URL` in `backend/.env.production` (your backend URL)
- `CORS_ORIGIN` in `backend/.env.production` (your Vercel frontend URL)

### 2) Run production stack

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This uses:

- multi-stage production build (`backend/Dockerfile`, `target: production`)
- Strapi `npm run start`
- persistent Postgres volume

---

## Deploy frontend to Vercel

### Option A: Vercel UI (recommended)

1. Import repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set environment variables:
   - `NEXT_PUBLIC_STRAPI_URL=https://your-backend-domain`
   - `NEXT_PUBLIC_STRAPI_KEY=your-strapi-api-token`
4. Deploy.

### Option B: Vercel CLI

```bash
npx vercel --cwd frontend
npx vercel --prod --cwd frontend
```

---

## Production checklist

- [ ] Backend is reachable at `https://your-backend-domain/api/health`
- [ ] `CORS_ORIGIN` includes your Vercel domain
- [ ] Frontend env vars in Vercel include Strapi URL + API key
- [ ] Strapi secrets are rotated from template values
- [ ] Postgres data is persisted and backed up
