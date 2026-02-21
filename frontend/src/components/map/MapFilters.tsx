import Link from "next/link";

import { type CountryFilters } from "@/lib/filters";

interface MapFiltersProps {
  filters: CountryFilters;
}

const levelOptions = [1, 2, 3, 4, 5];

export function MapFilters({ filters }: MapFiltersProps) {
  return (
    <form
      action="/"
      method="GET"
      className="grid gap-3 rounded-xl border border-white/30 bg-white/60 p-4 text-sm shadow-lg backdrop-blur-md md:grid-cols-3 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-1">
        <span className="font-medium text-stone-700">Min hiking level</span>
        <select
          name="minHiking"
          defaultValue={filters.minHiking ? String(filters.minHiking) : ""}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bba98a]"
        >
          <option value="">Any</option>
          {levelOptions.map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium text-stone-700">Min beach level</span>
        <select
          name="minBeach"
          defaultValue={filters.minBeach ? String(filters.minBeach) : ""}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bba98a]"
        >
          <option value="">Any</option>
          {levelOptions.map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium text-stone-700">Min roadtrip level</span>
        <select
          name="minRoadtrip"
          defaultValue={filters.minRoadtrip ? String(filters.minRoadtrip) : ""}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bba98a]"
        >
          <option value="">Any</option>
          {levelOptions.map((value) => (
            <option key={value} value={value}>
              {value}+
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium text-stone-700">Max flight (USD)</span>
        <input
          type="number"
          name="maxFlight"
          defaultValue={filters.maxFlight}
          min={0}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bba98a]"
          placeholder="500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium text-stone-700">Max budget range</span>
        <input
          type="number"
          name="maxBudget"
          defaultValue={filters.maxBudget}
          min={0}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bba98a]"
          placeholder="1000"
        />
      </label>

      <label className="flex items-center gap-2 self-end rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-700">
        <input
          type="checkbox"
          name="pregnancySafe"
          value="true"
          defaultChecked={filters.pregnancySafe === true}
          className="h-4 w-4 rounded border-stone-300"
        />
        Pregnancy safe
      </label>

      <label className="flex items-center gap-2 self-end rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-700">
        <input
          type="checkbox"
          name="infantSafe"
          value="true"
          defaultChecked={filters.infantSafe === true}
          className="h-4 w-4 rounded border-stone-300"
        />
        Infant safe
      </label>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[#6f5d43] px-4 py-2 font-semibold text-white transition hover:bg-[#5d4d37]"
        >
          Apply filters
        </button>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
