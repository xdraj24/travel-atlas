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
- `DATABASE_URL` (recommended for Railway and managed Postgres)
- or Postgres split variables (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`)

## Health endpoint

- `GET /api/health`

## Localization strategy (Czech base)

- Content localization is handled with **Strapi i18n locales**, not duplicated DB columns like
  `name_cs` / `name_en`.
- Default locale is configured as `cs` and enabled locales are `cs` and `en`.
- Seed data is upserted in both locales:
  - Czech (`cs`) is the base language.
  - English (`en`) is created/updated as a linked localization.

### Reseed steps

1. Start/restart Strapi (`npm run develop` or `npm run start`).
2. Bootstrap seeding runs automatically and upserts localized content.
3. If you need a clean reseed, reset database content first, then restart Strapi..
