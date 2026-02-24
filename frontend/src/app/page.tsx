import { WorldMap } from "@/components/map/WorldMap";
import { fetchCountries } from "@/lib/api";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/locale.server";

interface HomePageProps {
  searchParams: Promise<{
    view?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialView = params.view === "list" ? "list" : "map";
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const countries = await fetchCountries(undefined, locale, {
    includeStates: true,
    includeDisabled: true,
  });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] pt-20 text-[var(--text-primary)]">
      <WorldMap countries={countries} initialView={initialView} locale={locale} />

      <section id="journal" className="px-4 pb-16 pt-12 md:px-8">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-[20px] md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {dictionary.home.journalLabel}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-[var(--text-primary)]">
            {dictionary.home.journalTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
            {dictionary.home.journalDescription}
          </p>
        </div>
      </section>
    </main>
  );
}
