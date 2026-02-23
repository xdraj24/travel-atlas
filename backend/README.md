# Backend (Directus)

## Commands

```bash
npm run dev             # start Directus
npm run db:reset-seed   # truncate domain tables and seed initial data
npm run start           # start Directus (same as dev)
```

## Environment

Use:

- `.env.example` for generic setup
- `.env.production.example` as production template

Production env should define:

- `PUBLIC_URL` (public backend URL)
- `KEY`, `SECRET` (Directus crypto secrets)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (initial admin bootstrap)
- `CORS_ORIGIN` (frontend origins, e.g. Vercel domain)
- `DB_CONNECTION_STRING` (recommended for Railway Postgres)
- or split Postgres variables (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`)

## Health endpoint

- `GET /api/health`

## Data model notes

- The previous CMS runtime is fully retired.
- Domain tables use explicit SQL foreign keys for 1:n relationships.
- Content includes both `*_en` and `*_cs` fields.
- API locale selection is done via `?locale=cs|en`.

### Seed/reset flow

1. Ensure Postgres is available.
2. Run `npm run db:reset-seed`.
3. Start backend with `npm run start`.

If you want to reseed on every startup (not recommended for production), set:

```bash
RESET_AND_SEED_ON_BOOT=true
```
