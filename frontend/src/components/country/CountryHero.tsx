import { stripRichText, type Country } from "@/lib/api";
import { RatingPill } from "@/components/ui/RatingPill";

interface CountryHeroProps {
  country: Country;
}

export function CountryHero({ country }: CountryHeroProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#1a1e1c] shadow-[0_20px_48px_rgba(0,0,0,0.34)]">
      <div className="relative">
        {country.heroImage?.url ? (
          <img
            src={country.heroImage.url}
            alt={country.heroImage.alternativeText ?? country.name}
            className="h-64 w-full object-cover md:h-80"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-gradient-to-r from-[#27312d] to-[#151917] md:h-80">
            <p className="text-sm text-[#AEB9B1]">No hero image uploaded</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-[#121614]/30 to-transparent" />
      </div>

      <div className="space-y-4 p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#AEB9B1]">Adventure Card</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tighter text-[#F0F2F0]">
              {country.name}
            </h1>
          </div>
          <div className="min-w-[210px] rounded-2xl border border-[#D99E6B]/65 bg-[#D99E6B]/16 px-4 py-3 shadow-[0_0_28px_rgba(217,158,107,0.22)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#E7C7A1]">
              Minimal vs Optimal Stay
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tighter text-[#F6DEBE]">
              {country.minDays ?? "?"} - {country.optimalDays ?? "?"} days
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <RatingPill label="Hiking" value={country.hikingLevel} />
          <RatingPill label="Beach" value={country.beachLevel} />
          <RatingPill label="Roadtrip" value={country.roadtripLevel} accent="roadtrip" />
        </div>

        {country.description ? (
          <p className="text-sm leading-relaxed text-[#C0CAC3]">
            {stripRichText(country.description)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
