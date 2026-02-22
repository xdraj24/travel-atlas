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
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        isSafe
          ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-200"
          : "border-rose-300/30 bg-rose-500/10 text-rose-200"
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
    <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-6 pt-20 text-[var(--text-primary)] md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {country.isState && country.parentCountry ? (
          <Link
            href={`/countries/${country.parentCountry.slug}`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#C4CDC8]"
          >
            ← Back to {country.parentCountry.name}
          </Link>
        ) : null}

        <CountryHero country={country} />
        <CountryStatsStrip country={country} />

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">Wonders</h2>
          {country.wonders && country.wonders.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {country.wonders.map((wonder) => (
                <WonderCard key={wonder.id} wonder={wonder} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#AEB9B1]">No wonders published yet.</p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">Hikes</h2>
          {country.hikes && country.hikes.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {country.hikes.map((hike) => (
                <article
                  key={hike.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-[20px]"
                >
                  <h3 className="text-lg font-semibold tracking-tighter text-[#F0F2F0]">{hike.name}</h3>
                  <p className="mt-1 text-sm text-[#AEB9B1]">
                    Difficulty {hike.difficulty ?? "N/A"} / 5 · {hike.distanceKm ?? "?"} km ·{" "}
                    {hike.durationHours ?? "?"} hrs
                  </p>
                  {hike.description ? (
                    <p className="mt-2 text-sm text-[#C3CCC6]">
                      {stripRichText(hike.description)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#AEB9B1]">No hikes published yet.</p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">
            Travel Specialists
          </h2>
          {country.specialists && country.specialists.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {country.specialists.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#AEB9B1]">
              No specialists linked for this destination.
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">
            Best Combined With
          </h2>
          {country.bestCombinedWith && country.bestCombinedWith.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {country.bestCombinedWith.map((combination) => (
                <Link
                  key={combination.id}
                  href={`/countries/${combination.slug}`}
                  className="rounded-xl border border-white/12 bg-white/5 p-4 text-sm font-semibold text-[#D8E1DB] transition hover:bg-white/10"
                >
                  {combination.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#AEB9B1]">
              Combination links will appear when curated.
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">
            Safety Indicators
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SafetyBadge label="Pregnancy" safe={country.pregnancySafe} />
            <SafetyBadge label="Infant" safe={country.infantSafe} />
          </div>
        </SectionCard>

        {!country.isState && country.regions && country.regions.length > 0 ? (
          <SectionCard>
            <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">Regions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {country.regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/countries/${region.slug}`}
                  className="rounded-xl border border-white/12 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <h3 className="font-semibold tracking-tighter text-[#F0F2F0]">{region.name}</h3>
                  <p className="mt-1 text-sm text-[#AEB9B1]">
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
