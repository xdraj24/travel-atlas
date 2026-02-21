import { stripRichText, type Country } from "@/lib/api";
import { RatingPill } from "@/components/ui/RatingPill";

interface CountryHeroProps {
  country: Country;
}

export function CountryHero({ country }: CountryHeroProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-md">
      {country.heroImage?.url ? (
        <img
          src={country.heroImage.url}
          alt={country.heroImage.alternativeText ?? country.name}
          className="h-64 w-full object-cover md:h-80"
        />
      ) : (
        <div className="flex h-64 w-full items-center justify-center bg-gradient-to-r from-[#d7cfbf] to-[#f4ede1] md:h-80">
          <p className="text-stone-600">No hero image uploaded</p>
        </div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-stone-900">{country.name}</h1>
          <div className="rounded-full bg-[#6f5d43] px-4 py-1 text-sm font-semibold text-white">
            {country.minDays ?? "?"} - {country.optimalDays ?? "?"} days
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <RatingPill label="Hiking" value={country.hikingLevel} />
          <RatingPill label="Beach" value={country.beachLevel} />
          <RatingPill label="Roadtrip" value={country.roadtripLevel} />
        </div>

        {country.description ? (
          <p className="text-sm leading-relaxed text-stone-700">
            {stripRichText(country.description)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
