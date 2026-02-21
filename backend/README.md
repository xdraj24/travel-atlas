# Backend (Strapi)

## Commands

```bash
npm run develop   # local dev mode
npm run build     # build admin panel
npm run start     # production mode
```

## Environment

Use:

- `.env.example` for generic setup
- `.env.production.example` as production template

Production env should define:

- `PUBLIC_URL` (public backend URL)
- `CORS_ORIGIN` (comma-separated frontend origins, e.g. Vercel domain)
- strong secrets (`APP_KEYS`, `JWT_SECRET`, etc.)
- Postgres database variables

## Health endpoint

- `GET /api/health`
