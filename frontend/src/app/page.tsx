import { WorldMap } from "@/components/map/WorldMap";
import { fetchCountries } from "@/lib/api";

interface HomePageProps {
  searchParams: Promise<{
    view?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialView = params.view === "list" ? "list" : "map";
  const countries = await fetchCountries();

  return (
    <main className="min-h-screen bg-[var(--bg-base)] pt-20 text-[var(--text-primary)]">
      <WorldMap countries={countries} initialView={initialView} />

      <section id="journal" className="px-4 pb-16 pt-12 md:px-8">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-[20px] md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Journal
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-[var(--text-primary)]">
            Curated dispatches from route-tested adventures
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
            Field notes and itinerary essays are being curated now. Use the map or country list to
            discover destinations while the journal collection grows.
          </p>
        </div>
      </section>
    </main>
  );
}
