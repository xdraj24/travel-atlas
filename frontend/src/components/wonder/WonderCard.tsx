import Link from "next/link";

import { type WonderSummary } from "@/lib/api";

interface WonderCardProps {
  wonder: WonderSummary;
}

export function WonderCard({ wonder }: WonderCardProps) {
  return (
    <Link
      href={`/wonders/${wonder.slug}`}
      className="group block overflow-hidden rounded-xl border border-stone-200 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      {wonder.heroImage?.url ? (
        <img
          src={wonder.heroImage.url}
          alt={wonder.heroImage.alternativeText ?? wonder.name}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-gradient-to-r from-[#d7cfbf] to-[#f4ede1]" />
      )}
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-stone-900">{wonder.name}</h3>
        <p className="text-sm text-stone-600">
          {wonder.shortDescription ?? "Curated world wonder destination."}
        </p>
      </div>
    </Link>
  );
}
