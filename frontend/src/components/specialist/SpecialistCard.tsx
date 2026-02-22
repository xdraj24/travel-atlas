import Link from "next/link";

import { formatCurrency, type SpecialistSummary } from "@/lib/api";

interface SpecialistCardProps {
  specialist: SpecialistSummary;
}

function formatType(value: SpecialistSummary["type"]): string {
  return value === "local_advisor" ? "Local Advisor" : "Community Trip Leader";
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_14px_35px_rgba(0,0,0,0.2)] backdrop-blur-[20px] transition hover:-translate-y-1 hover:border-white/20">
      {specialist.profileImage?.url ? (
        <img
          src={specialist.profileImage.url}
          alt={specialist.profileImage.alternativeText ?? specialist.name}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 bg-gradient-to-r from-[#2b352f] to-[#171b19]" />
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tighter text-[#F0F2F0]">{specialist.name}</h3>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#AEB9B1]">
              {formatType(specialist.type)}
            </p>
          </div>
          <div className="rounded-full border border-[#D99E6B]/50 bg-[#D99E6B]/18 px-3 py-1 text-xs font-semibold text-[#F1D0AC]">
            ⭐ {specialist.rating?.toFixed(1) ?? "N/A"}
          </div>
        </div>

        <p className="text-sm text-[#AEB9B1]">
          Languages: {specialist.languages?.join(", ") || "English"}
        </p>

        <p className="text-sm text-[#D0D8D2]">
          Trips from {formatCurrency(specialist.tripPriceFrom)}
        </p>

        <div className="flex flex-wrap gap-2">
          {specialist.offersChat && specialist.whatsappLink ? (
            <a
              href={specialist.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-[#D2DBD5] transition hover:bg-white/10"
            >
              Chat
            </a>
          ) : null}
          <Link
            href={`/specialists/${specialist.slug}`}
            className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3F7650]"
          >
            View Trips
          </Link>
        </div>
      </div>
    </article>
  );
}
