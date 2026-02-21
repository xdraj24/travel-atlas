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

interface CountryPreviewPanelProps {
  country: CountrySummary;
  onClose: () => void;
}

type SafetyStatus = "safe" | "warning" | "alert";

interface RatingDotsProps {
  label: string;
  value: number;
  max?: number;
}

interface SafetyBadgeProps {
  type: "Pregnancy" | "Infant";
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

function SafetyBadge({ type, status, note }: SafetyBadgeProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${safetyDotClasses[status]}`} />
        <span className="text-sm font-medium text-text-primary">{type} Safe</span>
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

function getPreviewDescription(country: CountrySummary): string {
  const cleaned = stripRichText(country.description);
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length >= 24) {
    return firstSentence;
  }

  if ((country.hikingLevel ?? 0) >= 4 && (country.roadtripLevel ?? 0) >= 4) {
    return "Big mountain energy with cinematic roads and high-impact views.";
  }
  if ((country.hikingLevel ?? 0) >= 4) {
    return "Built for active days on ridgelines, forests, and alpine trails.";
  }
  if ((country.roadtripLevel ?? 0) >= 4) {
    return "A route-first destination with dramatic drives and hidden stops.";
  }
  return "A curated destination pick with balanced nature and comfort.";
}

function getBudgetLevel(country: CountrySummary): number {
  const accommodation = country.avgAccommodationPrice;
  const food = country.avgFoodPricePerDay;

  if ((accommodation ?? 0) >= 240 || (food ?? 0) >= 90) return 4;
  if ((accommodation ?? 0) >= 170 || (food ?? 0) >= 65) return 3;
  if ((accommodation ?? 0) >= 100 || (food ?? 0) >= 40) return 2;
  return 1;
}

function getDaysLabel(country: CountrySummary): string {
  if (country.minDays && country.optimalDays) {
    return `${country.minDays}-${country.optimalDays}`;
  }
  if (country.optimalDays) return String(country.optimalDays);
  if (country.minDays) return `${country.minDays}+`;
  return "Flexible";
}

function getWonderDifficulty(level: number | undefined): string {
  if (!level) return "Moderate";
  if (level >= 4) return "Advanced";
  if (level <= 2) return "Easy";
  return "Moderate";
}

function getRegionLabel(country: CountrySummary): string {
  return country.isState ? "Regional Escape" : "Country Escape";
}

function getWonders(country: CountrySummary) {
  return (country.wonders ?? []).slice(0, 5);
}

function PanelContent({ country, onClose }: CountryPreviewPanelProps) {
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
            <MapPin size={12} /> {getRegionLabel(country)}
          </p>
          <p className="pt-1 text-sm italic leading-snug text-text-secondary">
            &quot;{getPreviewDescription(country)}&quot;
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
          <RatingDots label="Hiking" value={hikingLevel} />
          <RatingDots label="Roadtrip" value={roadtripLevel} />
          <RatingDots label="Beaches" value={beachLevel} />
        </section>

        <section className="grid grid-cols-3 gap-2 border-y border-white/5 py-4 text-center">
          <div>
            <p className="text-[10px] uppercase text-text-secondary">Min Days</p>
            <p className="text-lg font-bold text-text-primary">{country.minDays ?? "?"}</p>
          </div>
          <div className="border-x border-white/5">
            <p className="text-[10px] uppercase text-text-secondary">Optimal</p>
            <p className="text-lg font-bold text-text-primary">{getDaysLabel(country)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-text-secondary">Budget</p>
            <p className="text-lg font-bold text-brand-primary">{"€".repeat(budgetLevel)}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <SafetyBadge
            type="Pregnancy"
            status={getSafetyStatus(country.pregnancySafe)}
            note="Low-altitude routes and high-access care zones available."
          />
          <SafetyBadge
            type="Infant"
            status={getSafetyStatus(country.infantSafe)}
            note="Avoid routes above 2500m for smoother acclimatization."
          />
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            Must See Wonders
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
                    🥾 {getWonderDifficulty(wonder.hikingDifficulty)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-xs text-text-secondary">
              Click around to discover destinations with curated wonders and route-ready picks.
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
            Explore {country.name} <ChevronRight size={18} />
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/countries/${country.slug}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 text-xs font-medium text-text-primary transition hover:bg-white/10"
            >
              <Compass size={14} /> Plan Trip
            </Link>
            <Link
              href="/specialists"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-3 text-xs font-medium text-text-primary transition hover:bg-white/10"
            >
              <MessageSquare size={14} /> Specialist
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function CountryPreviewPanel({ country, onClose }: CountryPreviewPanelProps) {
  return (
    <>
      <aside className="glass-panel animate-in slide-in-from-right absolute bottom-6 right-6 top-6 z-50 hidden w-[380px] flex-col overflow-hidden rounded-3xl p-0 md:flex">
        <PanelContent country={country} onClose={onClose} />
      </aside>

      <aside className="glass-panel animate-in slide-in-from-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl p-0 md:hidden">
        <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-white/20" />
        <PanelContent country={country} onClose={onClose} />
      </aside>
    </>
  );
}
