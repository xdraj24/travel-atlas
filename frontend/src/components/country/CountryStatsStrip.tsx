import { formatCurrency, type Country } from "@/lib/api";

interface CountryStatsStripProps {
  country: Country;
}

export function CountryStatsStrip({ country }: CountryStatsStripProps) {
  const items = [
    {
      label: "Avg direct flight",
      value: formatCurrency(country.avgDirectFlightPrice),
    },
    {
      label: "Avg cheap flight",
      value: formatCurrency(country.avgCheapFlightPrice),
    },
    {
      label: "Accommodation / night",
      value: formatCurrency(country.avgAccommodationPrice),
    },
    {
      label: "Food / day",
      value: formatCurrency(country.avgFoodPricePerDay),
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
