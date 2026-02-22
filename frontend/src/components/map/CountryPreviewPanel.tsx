"use client";

import Link from "next/link";
import {
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  MessageSquare,
  X,
} from "lucide-react";

import { stripRichText, type CountrySummary } from "@/lib/api";
import { getDictionary } from "@/lib/dictionary";
import { type AppLocale } from "@/lib/locale";

interface CountryPreviewPanelProps {
  country: CountrySummary;
  onClose: () => void;
  locale: AppLocale;
}

type SafetyStatus = "safe" | "warning" | "alert";

interface RatingDotsProps {
  label: string;
  value: number;
  max?: number;
}

interface SafetyBadgeProps {
  label: string;
  status: SafetyStatus;
  note?: string;
}

const safetyDotClasses: Record<SafetyStatus, string> = {
  safe: "bg-status-safe",
  warning: "bg-status-warning",
  alert: "bg-status-alert",
};

function RatingDots({ label, value, max = 5 }: RatingDotsProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs uppercase tracking-tighter text-text-secondary">{label}</span>
      <div className="flex gap-1">
        {[...Array(max)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < value ? "bg-brand-primary" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SafetyBadge({ label, status, note }: SafetyBadgeProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${safetyDotClasses[status]}`} />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      {note ? <p className="text-[11px] leading-tight text-text-secondary">{note}</p> : null}
    </div>
  );
}

function getSafetyStatus(value: boolean | undefined): SafetyStatus {
  if (value === true) return "safe";
  if (value === false) return "alert";
  return "warning";
}

function isoCodeToFlag(isoCode?: string): string {
  if (!isoCode || isoCode.length !== 2) return "🌍";
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function getPreviewDescription(country: CountrySummary, locale: AppLocale): string {
  const dictionary = getDictionary(locale);
  const cleaned = stripRichText(country.description);
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length >= 24) {
    return firstSentence;
  }

  if ((country.hikingLevel ?? 0) >= 4 && (country.roadtripLevel ?? 0) >= 4) {
    return dictionary.countryPreview.previewMountainRoad;
  }
  if ((country.hikingLevel ?? 0) >= 4) {
    return dictionary.countryPreview.previewHiking;
  }
  if ((country.roadtripLevel ?? 0) >= 4) {
    return dictionary.countryPreview.previewRoadtrip;
  }
  return dictionary.countryPreview.previewBalanced;
}

function getBudgetLevel(country: CountrySummary): number {
  const accommodation = country.avgAccommodationPrice;
  const food = country.avgFoodPricePerDay;

  if ((accommodation ?? 0) >= 240 || (food ?? 0) >= 90) return 4;
  if ((accommodation ?? 0) >= 170 || (food ?? 0) >= 65) return 3;
  if ((accommodation ?? 0) >= 100 || (food ?? 0) >= 40) return 2;
  return 1;
}

function getDaysLabel(country: CountrySummary, locale: AppLocale): string {
  const dictionary = getDictionary(locale);
  if (country.minDays && country.optimalDays) {
    return `${country.minDays}-${country.optimalDays}`;
  }
  if (country.optimalDays) return String(country.optimalDays);
  if (country.minDays) return `${country.minDays}+`;
  return dictionary.countryPreview.flexibleDays;
}

function getWonderDifficulty(level: number | undefined, locale: AppLocale): string {
  const dictionary = getDictionary(locale);
  if (!level) return dictionary.countryPreview.wonderModerate;
  if (level >= 4) return dictionary.countryPreview.wonderAdvanced;
  if (level <= 2) return dictionary.countryPreview.wonderEasy;
  return dictionary.countryPreview.wonderModerate;
}

function getRegionLabel(country: CountrySummary, locale: AppLocale): string {
  const dictionary = getDictionary(locale);
  return country.isState
    ? dictionary.countryPreview.regionRegional
    : dictionary.countryPreview.regionCountry;
}

function getWonders(country: CountrySummary) {
  return (country.wonders ?? []).slice(0, 5);
}

function PanelContent({ country, onClose, locale }: CountryPreviewPanelProps) {
  const dictionary = getDictionary(locale);
  const hikingLevel = Math.max(0, Math.min(5, Math.round(country.hikingLevel ?? 0)));
  const roadtripLevel = Math.max(0, Math.min(5, Math.round(country.roadtripLevel ?? 0)));
  const beachLevel = Math.max(0, Math.min(5, Math.round(country.beachLevel ?? 0)));
  const wonders = getWonders(country);
  const budgetLevel = getBudgetLevel(country);

  return (
    <>
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isoCodeToFlag(country.isoCode)}</span>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">{country.name}</h2>
          </div>
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-brand-highlight">
            <MapPin size={12} /> {getRegionLabel(country, locale)}
          </p>
          <p className="pt-1 text-sm italic leading-snug text-text-secondary">
            &quot;{getPreviewDescription(country, locale)}&quot;
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full bg-white/5 p-2 text-text-secondary transition hover:bg-white/10 hover:text-red-400">
            <Heart size={18} />
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-text-secondary transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="custom-scrollbar space-y-6 overflow-y-auto px-6 pb-28">
        <section className="space-y-1">
          <RatingDots label={dictionary.countryPreview.hikingLabel} value={hikingLevel} />
          <RatingDots label={dictionary.countryPreview.roadtripLabel} value={roadtripLevel} />
          <RatingDots label={dictionary.countryPreview.beachesLabel} value={beachLevel} />
        </section>

        <section className="grid grid-cols-3 gap-2 border-y border-white/5 py-4 text-center">
          <div>
            <p className="text-[10px] uppercase text-text-secondary">
              {dictionary.countryPreview.minDaysLabel}
            </p>
            <p className="text-lg font-bold text-text-primary">
              {country.minDays ?? dictionary.common.unknown}
            </p>
          </div>
          <div className="border-x border-white/5">
            <p className="text-[10px] uppercase text-text-secondary">
              {dictionary.countryPreview.optimalLabel}
            </p>
            <p className="text-lg font-bold text-text-primary">{getDaysLabel(country, locale)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-text-secondary">
              {dictionary.countryPreview.budgetLabel}
            </p>
            <p className="text-lg font-bold text-brand-primary">{"€".repeat(budgetLevel)}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <SafetyBadge
            label={`${dictionary.countryPreview.pregnancyLabel} ${dictionary.countryPreview.safeSuffix}`}
            status={getSafetyStatus(country.pregnancySafe)}
            note={dictionary.countryPreview.pregnancyNote}
          />
          <SafetyBadge
            label={`${dictionary.countryPreview.infantLabel} ${dictionary.countryPreview.safeSuffix}`}
            status={getSafetyStatus(country.infantSafe)}
            note={dictionary.countryPreview.infantNote}
          />
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            {dictionary.countryPreview.mustSeeWonders}
          </h4>
          {wonders.length > 0 ? (
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              {wonders.map((wonder, index) => (
                <div
                  key={wonder.id}
                  className="group min-w-[120px] cursor-pointer animate-staggered-fade"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="mb-2 aspect-[4/5] overflow-hidden rounded-xl bg-white/10">
                    {wonder.heroImage?.url ? (
                      <img
                        src={wonder.heroImage.url}
                        alt={wonder.heroImage.alternativeText ?? wonder.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#335347] to-[#1f2b26]" />
                    )}
                  </div>
                  <p className="truncate text-[11px] font-medium text-text-primary">{wonder.name}</p>
                  <p className="text-[9px] text-text-secondary">
                    🥾 {getWonderDifficulty(wonder.hikingDifficulty, locale)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-xs text-text-secondary">
              {dictionary.countryPreview.noWonders}
            </div>
          )}
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-surface via-bg-surface to-transparent p-6 pt-10">
        <div className="flex flex-col gap-2">
          <Link
            href={`/countries/${country.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-earth-green py-4 font-bold text-white shadow-xl transition hover:bg-earth-hover"
          >
            {dictionary.countryPreview.explorePrefix} {country.name} <ChevronRight size={18} />
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/countries/${country.slug}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 text-xs font-medium text-text-primary transition hover:bg-white/10"
            >
              <Compass size={14} /> {dictionary.countryPreview.planTrip}
            </Link>
            <Link
              href="/specialists"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 text-xs font-medium text-text-primary transition hover:bg-white/10"
            >
              <MessageSquare size={14} /> {dictionary.countryPreview.specialist}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function CountryPreviewPanel({ country, onClose, locale }: CountryPreviewPanelProps) {
  return (
    <>
      <aside className="glass-panel animate-in slide-in-from-right absolute bottom-6 right-6 top-6 z-50 hidden w-[380px] flex-col overflow-hidden rounded-3xl p-0 md:flex">
        <PanelContent country={country} onClose={onClose} locale={locale} />
      </aside>

      <aside className="glass-panel animate-in slide-in-from-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl p-0 md:hidden">
        <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-white/20" />
        <PanelContent country={country} onClose={onClose} locale={locale} />
      </aside>
    </>
  );
}
