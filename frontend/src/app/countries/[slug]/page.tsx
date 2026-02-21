import Link from "next/link";
import { notFound } from "next/navigation";

import { CountryHero } from "@/components/country/CountryHero";
import { CountryStatsStrip } from "@/components/country/CountryStatsStrip";
import { SpecialistCard } from "@/components/specialist/SpecialistCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { WonderCard } from "@/components/wonder/WonderCard";
import { fetchCountryBySlug, stripRichText } from "@/lib/api";

interface CountryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function SafetyBadge({ label, safe }: { label: string; safe?: boolean }) {
  const isSafe = safe ?? false;
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm font-semibold ${
        isSafe
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {label}: {isSafe ? "Safe" : "Caution"}
    </div>
  );
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const country = await fetchCountryBySlug(slug);
  if (!country) notFound();

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {country.isState && country.parentCountry ? (
          <Link
            href={`/countries/${country.parentCountry.slug}`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-stone-700"
          >
            ← Back to {country.parentCountry.name}
          </Link>
        ) : null}

        <CountryHero country={country} />
        <CountryStatsStrip country={country} />

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Wonders</h2>
          {country.wonders && country.wonders.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {country.wonders.map((wonder) => (
                <WonderCard key={wonder.id} wonder={wonder} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">No wonders published yet.</p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Hikes</h2>
          {country.hikes && country.hikes.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {country.hikes.map((hike) => (
                <article
                  key={hike.id}
                  className="rounded-xl border border-stone-200 bg-white p-4"
                >
                  <h3 className="text-lg font-semibold text-stone-900">{hike.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    Difficulty {hike.difficulty ?? "N/A"} / 5 · {hike.distanceKm ?? "?"} km ·{" "}
                    {hike.durationHours ?? "?"} hrs
                  </p>
                  {hike.description ? (
                    <p className="mt-2 text-sm text-stone-700">
                      {stripRichText(hike.description)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">No hikes published yet.</p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Travel Specialists</h2>
          {country.specialists && country.specialists.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {country.specialists.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">
              No specialists linked for this destination.
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Best Combined With</h2>
          {country.bestCombinedWith && country.bestCombinedWith.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {country.bestCombinedWith.map((combination) => (
                <Link
                  key={combination.id}
                  href={`/countries/${combination.slug}`}
                  className="rounded-xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
                >
                  {combination.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">
              Combination links will appear when curated.
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Safety Indicators</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SafetyBadge label="Pregnancy" safe={country.pregnancySafe} />
            <SafetyBadge label="Infant" safe={country.infantSafe} />
          </div>
        </SectionCard>

        {!country.isState && country.regions && country.regions.length > 0 ? (
          <SectionCard>
            <h2 className="text-2xl font-semibold text-stone-900">Regions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {country.regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/countries/${region.slug}`}
                  className="rounded-xl border border-stone-200 bg-white p-4 transition hover:bg-stone-50"
                >
                  <h3 className="font-semibold text-stone-900">{region.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    Explore regional itinerary details.
                  </p>
                </Link>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </main>
  );
}
