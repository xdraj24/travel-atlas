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
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white/85 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {specialist.profileImage?.url ? (
        <img
          src={specialist.profileImage.url}
          alt={specialist.profileImage.alternativeText ?? specialist.name}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 bg-gradient-to-r from-[#d7cfbf] to-[#f4ede1]" />
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{specialist.name}</h3>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {formatType(specialist.type)}
            </p>
          </div>
          <div className="rounded-full bg-[#f4ede1] px-3 py-1 text-xs font-semibold text-[#6f5d43]">
            ⭐ {specialist.rating?.toFixed(1) ?? "N/A"}
          </div>
        </div>

        <p className="text-sm text-stone-600">
          Languages: {specialist.languages?.join(", ") || "English"}
        </p>

        <p className="text-sm text-stone-700">
          Trips from {formatCurrency(specialist.tripPriceFrom)}
        </p>

        <div className="flex flex-wrap gap-2">
          {specialist.offersChat && specialist.whatsappLink ? (
            <a
              href={specialist.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Chat
            </a>
          ) : null}
          <Link
            href={`/specialists/${specialist.slug}`}
            className="rounded-lg bg-[#6f5d43] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5d4d37]"
          >
            View Trips
          </Link>
        </div>
      </div>
    </article>
  );
}
