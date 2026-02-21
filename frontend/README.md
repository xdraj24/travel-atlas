# Frontend (Next.js)

## Local development

```bash
cp .env.example .env.local
npm run dev
```

Required env vars:

- `NEXT_PUBLIC_STRAPI_URL` (public URL to Strapi)
- `NEXT_PUBLIC_STRAPI_KEY` (Strapi API token)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (Mapbox public access token)
- `NEXT_PUBLIC_MAPBOX_STYLE` (optional Mapbox style URL, defaults to `mapbox://styles/mapbox/dark-v11`)

## Deploy to Vercel

Deploy this folder as the project root (`frontend`) and set the same environment variables in Vercel.
