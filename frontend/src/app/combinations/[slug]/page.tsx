import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/ui/SectionCard";
import { fetchCountryCombinationBySlug, stripRichText } from "@/lib/api";

interface CombinationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CombinationPage({ params }: CombinationPageProps) {
  const { slug } = await params;
  const combination = await fetchCountryCombinationBySlug(slug);
  if (!combination) notFound();

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-6 pt-20 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-2xl border border-stone-200 bg-white/85 p-6 shadow-sm">
          <p className="inline-flex rounded-full border border-[#bba98a] bg-[#f4ede1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6f5d43]">
            Country Combination
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-900">{combination.name}</h1>
          <p className="mt-2 text-sm text-stone-700">
            {stripRichText(combination.description)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-full bg-[#6f5d43] px-4 py-1 text-sm font-semibold text-white">
              Min days: {combination.minDays ?? "N/A"}
            </div>
            <div className="rounded-full bg-[#8f7b57] px-4 py-1 text-sm font-semibold text-white">
              Optimal days: {combination.optimalDays ?? "N/A"}
            </div>
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Countries</h2>
          {combination.countries && combination.countries.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {combination.countries.map((country) => (
                <Link
                  key={country.id}
                  href={`/countries/${country.slug}`}
                  className="rounded-xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
                >
                  {country.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">No countries linked yet.</p>
          )}
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Route Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            {stripRichText(combination.routeDescription)}
          </p>
        </SectionCard>
      </div>
    </main>
  );
}
