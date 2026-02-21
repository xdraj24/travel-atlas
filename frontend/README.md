# Frontend (Next.js)

## Local development

```bash
cp .env.example .env.local
npm run dev
```

Required env vars:

- `NEXT_PUBLIC_STRAPI_URL` (public URL to Strapi)
- `STRAPI_URL` (optional server-side override)

## Deploy to Vercel

Deploy this folder as the project root (`frontend`) and set the same environment variables in Vercel.
