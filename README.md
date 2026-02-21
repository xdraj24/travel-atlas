# Vercel + Next.js + Strapi (Postgres) Boilerplate

Base fullstack setup with:

- **Frontend:** Next.js (App Router) in `frontend/`
- **Backend:** Strapi (Node.js) in `backend/`
- **Database:** PostgreSQL via Docker

The frontend is ready to deploy on **Vercel**, and the backend is containerized for easy hosting anywhere Docker is available.

---

## Project structure

```text
.
├── frontend/            # Next.js app (deploy this to Vercel)
├── backend/             # Strapi app (Dockerized)
└── docker-compose.yml   # Strapi + Postgres local stack
```

---

## 1) Run backend (Strapi + Postgres with Docker)

From repository root:

```bash
docker compose up --build
```

Services:

- Strapi: `http://localhost:1337`
- Postgres: `localhost:5432` (`strapi/strapi`, db: `strapi`)

Health endpoint:

- `GET http://localhost:1337/api/health`

---

## 2) Run frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

Frontend:

- `http://localhost:3000`

The homepage checks Strapi health and shows connection status.

---

## 3) Deploy frontend to Vercel

1. Import this repository in Vercel.
2. In project settings, set **Root Directory** to `frontend`.
3. Set environment variable:
   - `NEXT_PUBLIC_STRAPI_URL=https://your-strapi-domain`
4. Deploy.

Optional server-side override:

- `STRAPI_URL=https://your-strapi-domain`

CLI alternative:

```bash
npx vercel --cwd frontend
npx vercel --prod --cwd frontend
```

---

## Backend Docker notes

- Backend image definition: `backend/Dockerfile`
- Local development stack: `docker-compose.yml`
- Strapi uses PostgreSQL by default (`backend/config/database.js`)

For production, deploy the backend container and a managed PostgreSQL instance, then point Vercel frontend env vars to that backend URL.
