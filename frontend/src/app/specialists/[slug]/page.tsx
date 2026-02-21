import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/ui/SectionCard";
import {
  fetchSpecialistBySlug,
  formatCurrency,
  stripRichText,
} from "@/lib/api";

interface SpecialistDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SpecialistDetailPage({
  params,
}: SpecialistDetailPageProps) {
  const { slug } = await params;
  const specialist = await fetchSpecialistBySlug(slug);
  if (!specialist) notFound();

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white/85 shadow-sm">
          {specialist.profileImage?.url ? (
            <img
              src={specialist.profileImage.url}
              alt={specialist.profileImage.alternativeText ?? specialist.name}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="h-72 bg-gradient-to-r from-[#d7cfbf] to-[#f4ede1]" />
          )}
          <div className="space-y-3 p-6">
            <h1 className="text-3xl font-bold text-stone-900">{specialist.name}</h1>
            <p className="text-sm text-stone-600">
              {specialist.type === "local_advisor"
                ? "Local Advisor"
                : "Community Trip Leader"}
            </p>
            <p className="text-sm text-stone-700">
              Rating: ⭐ {specialist.rating?.toFixed(1) ?? "N/A"} · Languages:{" "}
              {specialist.languages?.join(", ") || "English"}
            </p>
            {specialist.country ? (
              <Link
                href={`/countries/${specialist.country.slug}`}
                className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Based in {specialist.country.name}
              </Link>
            ) : null}
            {specialist.bio ? (
              <p className="text-sm text-stone-700">{stripRichText(specialist.bio)}</p>
            ) : null}
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">External Booking Links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {specialist.offersChat && specialist.whatsappLink ? (
              <a
                href={specialist.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#6f5d43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5d4d37]"
              >
                Chat on WhatsApp
              </a>
            ) : null}
            {specialist.instagramLink ? (
              <a
                href={specialist.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Instagram
              </a>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-stone-900">Trips</h2>
          {specialist.trips && specialist.trips.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {specialist.trips.map((trip) => (
                <article
                  key={trip.id}
                  className="rounded-xl border border-stone-200 bg-white p-4"
                >
                  <h3 className="text-lg font-semibold text-stone-900">{trip.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {trip.durationDays ?? "?"} days · {formatCurrency(trip.price)} ·
                    Difficulty {trip.difficulty ?? "N/A"}/5
                  </p>
                  {trip.description ? (
                    <p className="mt-2 text-sm text-stone-700">
                      {stripRichText(trip.description)}
                    </p>
                  ) : null}
                  {specialist.whatsappLink ? (
                    <a
                      href={specialist.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      Book Externally
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-600">No published trips yet.</p>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
