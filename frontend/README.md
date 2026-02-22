# Frontend (Next.js)

## Local development

```bash
cp .env.example .env.local
npm run dev
```

Required env vars:

- `STRAPI_URL` (server-side URL to Strapi, preferred)
- `NEXT_PUBLIC_STRAPI_URL` (public URL to Strapi; if both are set, server requests use `STRAPI_URL`)
- `NEXT_PUBLIC_STRAPI_KEY` (Strapi API token)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (Mapbox public access token)
- `NEXT_PUBLIC_MAPBOX_STYLE` (optional Mapbox style URL, defaults to `mapbox://styles/mapbox/dark-v11`)

## Deploy to Vercel

Deploy this folder as the project root (`frontend`) and set the same environment variables in Vercel.
Set `STRAPI_URL` to your running Strapi instance URL so server-side fetches always target deployed backend.
