import { MapFilters } from "@/components/map/MapFilters";
import { WorldMap } from "@/components/map/WorldMap";
import { fetchCountries } from "@/lib/api";
import { parseCountryFilters, type SearchParams } from "@/lib/filters";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const filters = parseCountryFilters(params);

  const countries = await fetchCountries(filters);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="space-y-3">
          <p className="inline-flex rounded-full border border-[#bba98a] bg-[#f4ede1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6f5d43]">
            Alpha MVP
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            Interactive Travel Discovery Map
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-stone-700 md:text-base">
            Discover destinations by hiking, beach, and roadtrip profiles, apply
            pregnancy and infant safety filters, and move directly into each country
            planning page.
          </p>
        </div>

        <MapFilters filters={filters} />

        <WorldMap countries={countries} />

        <div className="rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 shadow-sm">
          {countries.length} countries matched your filters (states are shown only
          inside parent country pages).
        </div>
      </section>
    </main>
  );
}
