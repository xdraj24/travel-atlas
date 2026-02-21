import styles from "./page.module.css";

function normalizeUrl(url) {
  return url.replace(/\/+$/, "");
}

async function getStrapiStatus() {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  const strapiKey = process.env.NEXT_PUBLIC_STRAPI_KEY || "";

  if (!strapiUrl) {
    return {
      strapiUrl: "not configured",
      hasApiKey: Boolean(strapiKey),
      reachable: false,
      error: "Missing NEXT_PUBLIC_STRAPI_URL",
    };
  }

  if (!strapiKey) {
    return {
      strapiUrl,
      hasApiKey: false,
      reachable: false,
      error: "Missing NEXT_PUBLIC_STRAPI_KEY",
    };
  }

  try {
    const response = await fetch(`${normalizeUrl(strapiUrl)}/api/health`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${strapiKey}`,
      },
    });

    if (!response.ok) {
      return {
        strapiUrl,
        hasApiKey: true,
        reachable: false,
        error: `Strapi returned HTTP ${response.status}`,
      };
    }

    const payload = await response.json();
    return {
      strapiUrl,
      hasApiKey: true,
      reachable: true,
      payload,
    };
  } catch (error) {
    return {
      strapiUrl,
      hasApiKey: true,
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
        <h1>Vercel-ready frontend for external Strapi backend</h1>
        <p className={styles.description}>
          This starter connects your Next.js frontend to a separately deployed
          Strapi API using URL + API key environment variables.
        </p>
      </section>

      <section className={styles.card}>
        <h2>Backend connection status</h2>
        <p>
          URL: <code>{status.strapiUrl}</code>
        </p>
        <p>API key configured: {status.hasApiKey ? "yes" : "no"}</p>
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
            Deploy your Strapi backend separately
          </li>
          <li>
            Run frontend with <code>cd frontend && npm run dev</code>
          </li>
          <li>
            Set <code>NEXT_PUBLIC_STRAPI_URL</code> and{" "}
            <code>NEXT_PUBLIC_STRAPI_KEY</code> in Vercel
          </li>
        </ol>
      </section>
    </main>
  );
}
