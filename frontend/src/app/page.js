import styles from "./page.module.css";

const defaultStrapiUrl = "http://localhost:1337";

async function getStrapiStatus() {
  const strapiUrl =
    process.env.STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    defaultStrapiUrl;

  try {
    const response = await fetch(`${strapiUrl}/api/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        strapiUrl,
        reachable: false,
        error: `Strapi returned HTTP ${response.status}`,
      };
    }

    const payload = await response.json();
    return {
      strapiUrl,
      reachable: true,
      payload,
    };
  } catch (error) {
    return {
      strapiUrl,
      reachable: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function Home() {
  const status = await getStrapiStatus();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.badge}>Next.js + Strapi + PostgreSQL</p>
        <h1>Vercel-ready frontend with Dockerized backend</h1>
        <p className={styles.description}>
          This starter connects your Next.js frontend to Strapi. Deploy the
          frontend to Vercel and run the backend with Docker + Postgres.
        </p>
      </section>

      <section className={styles.card}>
        <h2>Backend connection status</h2>
        <p>
          URL: <code>{status.strapiUrl}</code>
        </p>
        {status.reachable ? (
          <p className={styles.ok}>
            Reachable: {status.payload.status} ({status.payload.service})
          </p>
        ) : (
          <p className={styles.error}>Unreachable: {status.error}</p>
        )}
      </section>

      <section className={styles.card}>
        <h2>Quick start</h2>
        <ol>
          <li>
            Start backend services with <code>docker compose up --build</code>
          </li>
          <li>
            Run frontend with <code>cd frontend && npm run dev</code>
          </li>
          <li>
            Set <code>NEXT_PUBLIC_STRAPI_URL</code> in Vercel when deploying
          </li>
        </ol>
      </section>
    </main>
  );
}
