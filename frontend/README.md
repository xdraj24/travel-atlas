# Frontend (Next.js)

## Local development

```bash
cp .env.example .env.local
npm run dev
```

Required env vars:

- `DIRECTUS_URL` (server-side URL to Directus, preferred)
- `NEXT_PUBLIC_DIRECTUS_URL` (public Directus URL; if both are set, server requests use `DIRECTUS_URL`)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (Mapbox public access token)
- `NEXT_PUBLIC_MAPBOX_STYLE` (optional Mapbox style URL, defaults to `mapbox://styles/mapbox/dark-v11`)

## Deploy to Vercel

Deploy this folder as the project root (`frontend`) and set the same environment variables in Vercel.
Set `DIRECTUS_URL` to your running Directus instance URL so server-side fetches always target deployed backend.
