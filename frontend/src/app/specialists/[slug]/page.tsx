import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/ui/SectionCard";
import {
  fetchSpecialistBySlug,
  formatCurrency,
  stripRichText,
} from "@/lib/api";
import { getRequestLocale } from "@/lib/locale.server";

interface SpecialistDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SpecialistDetailPage({
  params,
}: SpecialistDetailPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const specialist = await fetchSpecialistBySlug(slug, locale);
  if (!specialist) notFound();
  const requestJoinHref = specialist.whatsappLink ?? specialist.instagramLink ?? "/specialists";
  const openRequestExternally = requestJoinHref.startsWith("http");

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-6 pt-20 text-[var(--text-primary)] md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1a1e1c] shadow-[0_20px_55px_rgba(0,0,0,0.34)]">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            <div className="relative min-h-[340px]">
              {specialist.profileImage?.url ? (
                <img
                  src={specialist.profileImage.url}
                  alt={specialist.profileImage.alternativeText ?? specialist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-[#27312d] to-[#151917]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-[#121614]/25 to-transparent" />
            </div>

            <div className="space-y-4 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[#AEB9B1]">Specialist Profile</p>
              <h1 className="text-4xl font-semibold tracking-tighter text-[#F0F2F0]">
                {specialist.name}
              </h1>
              <p className="text-sm text-[#AEB9B1]">
                {specialist.type === "local_advisor"
                  ? "Local Advisor"
                  : "Community Trip Leader"}
              </p>
              <p className="text-sm text-[#CFD7D1]">
                Rating: ⭐ {specialist.rating?.toFixed(1) ?? "N/A"} · Languages:{" "}
                {specialist.languages?.join(", ") || "English"}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {specialist.country ? (
                  <Link
                    href={`/countries/${specialist.country.slug}`}
                    className="inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C8D1CB] transition hover:bg-white/10"
                  >
                    Based in {specialist.country.name}
                  </Link>
                ) : null}

                <a
                  href={requestJoinHref}
                  target={openRequestExternally ? "_blank" : undefined}
                  rel={openRequestExternally ? "noopener noreferrer" : undefined}
                  className="inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3F7650]"
                >
                  Request to Join
                </a>
              </div>

              {specialist.bio ? (
                <p className="text-sm leading-relaxed text-[#C2CCC5]">{stripRichText(specialist.bio)}</p>
              ) : null}
            </div>
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">
            External Booking Links
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {specialist.offersChat && specialist.whatsappLink ? (
              <a
                href={specialist.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3F7650]"
              >
                Chat on WhatsApp
              </a>
            ) : null}
            {specialist.instagramLink ? (
              <a
                href={specialist.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-[#D1D9D3] transition hover:bg-white/10"
              >
                Instagram
              </a>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="text-2xl font-semibold tracking-tighter text-[#F0F2F0]">Trips</h2>
          {specialist.trips && specialist.trips.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {specialist.trips.map((trip) => (
                <article
                  key={trip.id}
                  className="rounded-xl border border-white/12 bg-white/5 p-4 backdrop-blur-[20px]"
                >
                  <h3 className="text-lg font-semibold tracking-tighter text-[#F0F2F0]">{trip.title}</h3>
                  <p className="mt-1 text-sm text-[#AEB9B1]">
                    {trip.durationDays ?? "?"} days · {formatCurrency(trip.price)} ·
                    Difficulty {trip.difficulty ?? "N/A"}/5
                  </p>
                  {trip.description ? (
                    <p className="mt-2 text-sm text-[#C4CDC7]">
                      {stripRichText(trip.description)}
                    </p>
                  ) : null}
                  {specialist.whatsappLink ? (
                    <a
                      href={specialist.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-[#D1D9D3] transition hover:bg-white/10"
                    >
                      Book Externally
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#AEB9B1]">No published trips yet.</p>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
