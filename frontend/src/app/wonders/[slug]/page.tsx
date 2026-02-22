import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/ui/SectionCard";
import { WonderMarkerMap } from "@/components/wonder/WonderMarkerMap";
import { fetchWonderBySlug, stripRichText } from "@/lib/api";
import { getDictionary } from "@/lib/dictionary";
import { type AppLocale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale.server";
import { computeSafetyWithAltitudeFallback } from "@/lib/safety";

interface WonderPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function SafetyPill({ label, safe, locale }: { label: string; safe: boolean; locale: AppLocale }) {
  const dictionary = getDictionary(locale);
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        safe ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {label}: {safe ? dictionary.common.safe : dictionary.common.caution}
    </span>
  );
}

export default async function WonderPage({ params }: WonderPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const wonder = await fetchWonderBySlug(slug, locale);
  if (!wonder) notFound();

  const computedSafety = computeSafetyWithAltitudeFallback({
    altitudeMeters: wonder.altitudeMeters,
    pregnancySafe: wonder.pregnancySafe,
    infantSafe: wonder.infantSafe,
  });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-6 pt-20 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-sm">
          {wonder.heroImage?.url ? (
            <img
              src={wonder.heroImage.url}
              alt={wonder.heroImage.alternativeText ?? wonder.name}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="h-72 bg-gradient-to-r from-[#d7cfbf] to-[#f4ede1]" />
          )}

          <div className="space-y-3 p-6">
            <h1 className="text-3xl font-bold text-stone-900">{wonder.name}</h1>
            <p className="text-sm text-stone-700">
              {stripRichText(wonder.fullDescription ?? wonder.shortDescription)}
            </p>
            <div className="flex flex-wrap gap-2">
              <SafetyPill
                label={dictionary.wonderPage.pregnancyLabel}
                safe={computedSafety.pregnancySafe}
                locale={locale}
              />
              <SafetyPill
                label={dictionary.wonderPage.infantLabel}
                safe={computedSafety.infantSafe}
                locale={locale}
              />
            </div>
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">
            {dictionary.wonderPage.locationStatsHeading}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <WonderMarkerMap
              lat={wonder.locationLat}
              lng={wonder.locationLng}
              label={wonder.name}
              locale={locale}
            />
            <div className="grid gap-3">
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {dictionary.wonderPage.altitudeLabel}
                </p>
                <p className="mt-1 text-2xl font-bold text-stone-900">
                  {wonder.altitudeMeters ?? dictionary.common.notAvailable} m
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {dictionary.wonderPage.difficultyLabel}
                </p>
                <p className="mt-1 text-2xl font-bold text-stone-900">
                  {wonder.hikingDifficulty ?? dictionary.common.notAvailable} / 5
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  {dictionary.wonderPage.coordinatesLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-800">
                  {wonder.locationLat ?? dictionary.common.notAvailable},{" "}
                  {wonder.locationLng ?? dictionary.common.notAvailable}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">
            {dictionary.wonderPage.linkedHikesHeading}
          </h2>
          {wonder.hikes && wonder.hikes.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {wonder.hikes.map((hike) => (
                <article
                  key={hike.id}
                  className="rounded-xl border border-stone-200 bg-white p-4"
                >
                  <h3 className="text-lg font-semibold text-stone-900">{hike.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {dictionary.wonderPage.hikeDifficulty}{" "}
                    {hike.difficulty ?? dictionary.common.notAvailable} / 5 ·{" "}
                    {hike.distanceKm ?? dictionary.common.unknown} km
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
            <p className="mt-3 text-sm text-stone-600">
              {dictionary.wonderPage.noLinkedHikes}
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">
            {dictionary.wonderPage.linkedCountriesHeading}
          </h2>
          {wonder.country && wonder.country.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {wonder.country.map((country) => (
                <Link
                  key={country.id}
                  href={`/countries/${country.slug}`}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
                >
                  {country.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">{dictionary.wonderPage.noLinkedCountries}</p>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
