import { formatCurrency, type Country } from "@/lib/api";
import { getDictionary } from "@/lib/dictionary";
import { type AppLocale } from "@/lib/locale";

interface CountryStatsStripProps {
  country: Country;
  locale: AppLocale;
}

export function CountryStatsStrip({ country, locale }: CountryStatsStripProps) {
  const dictionary = getDictionary(locale);

  const items = [
    {
      label: dictionary.countryStats.avgDirectFlight,
      value: formatCurrency(country.avgDirectFlightPrice, "USD", locale),
    },
    {
      label: dictionary.countryStats.avgCheapFlight,
      value: formatCurrency(country.avgCheapFlightPrice, "USD", locale),
    },
    {
      label: dictionary.countryStats.accommodationPerNight,
      value: formatCurrency(country.avgAccommodationPrice, "USD", locale),
    },
    {
      label: dictionary.countryStats.foodPerDay,
      value: formatCurrency(country.avgFoodPricePerDay, "USD", locale),
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_14px_35px_rgba(0,0,0,0.2)] backdrop-blur-[20px]"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-[#9EA8A2]">{item.label}</p>
          <p className="mt-2 text-lg font-semibold tracking-tighter text-[#F0F2F0]">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
