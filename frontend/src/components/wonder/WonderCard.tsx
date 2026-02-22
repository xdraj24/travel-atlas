import Link from "next/link";

import { type WonderSummary } from "@/lib/api";
import { getDictionary } from "@/lib/dictionary";
import { type AppLocale } from "@/lib/locale";

interface WonderCardProps {
  wonder: WonderSummary;
  locale: AppLocale;
}

export function WonderCard({ wonder, locale }: WonderCardProps) {
  const dictionary = getDictionary(locale);

  return (
    <Link
      href={`/wonders/${wonder.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_14px_35px_rgba(0,0,0,0.2)] backdrop-blur-[20px] transition hover:-translate-y-1 hover:border-white/20"
    >
      {wonder.heroImage?.url ? (
        <img
          src={wonder.heroImage.url}
          alt={wonder.heroImage.alternativeText ?? wonder.name}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-gradient-to-r from-[#2b352f] to-[#171b19]" />
      )}
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold tracking-tighter text-[#F0F2F0]">{wonder.name}</h3>
        <p className="text-sm text-[#B3BDB7]">
          {wonder.shortDescription ?? dictionary.wonderCard.fallbackDescription}
        </p>
      </div>
    </Link>
  );
}
