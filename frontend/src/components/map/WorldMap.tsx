"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { type CountrySummary } from "@/lib/api";

interface WorldMapProps {
  countries: CountrySummary[];
}

interface GeographyLike {
  rsmKey: string;
  id?: string | number;
  properties?: Record<string, unknown>;
}

const geographyUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

function normalizeCountryKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function getProperty(properties: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

export function WorldMap({ countries }: WorldMapProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [modalCountry, setModalCountry] = useState<CountrySummary | null>(null);

  const countriesByName = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    countries.forEach((country) => {
      map.set(normalizeCountryKey(country.name), country);
    });
    return map;
  }, [countries]);

  const countriesByIso = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    countries.forEach((country) => {
      if (country.isoCode) {
        map.set(country.isoCode.toLowerCase(), country);
      }
    });
    return map;
  }, [countries]);

  const resolveCountry = (geography: GeographyLike): CountrySummary | undefined => {
    const properties = geography.properties ?? {};
    const geoName = getProperty(properties, ["name", "NAME", "admin", "ADMIN"]);
    const isoCode = getProperty(properties, [
      "iso_a2",
      "ISO_A2",
      "iso_a3",
      "ISO_A3",
      "id",
    ]).toLowerCase();

    if (isoCode && countriesByIso.has(isoCode)) {
      return countriesByIso.get(isoCode);
    }
    if (geoName) {
      return countriesByName.get(normalizeCountryKey(geoName));
    }
    return undefined;
  };

  return (
    <div className="relative h-[80vh] min-h-[620px] w-full overflow-hidden rounded-2xl border border-white/40 bg-white/35 shadow-2xl backdrop-blur-sm md:h-[calc(100vh-220px)]">
      <ComposableMap
        projectionConfig={{ scale: 150 }}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geographyUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geography = geo as unknown as GeographyLike;
              const country = resolveCountry(geography);
              const isHovered = hoveredSlug === country?.slug;

              return (
                <Geography
                  key={geography.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    if (country) setHoveredSlug(country.slug);
                  }}
                  onMouseLeave={() => {
                    setHoveredSlug(null);
                  }}
                  onClick={() => {
                    if (country) setModalCountry(country);
                  }}
                  style={{
                    default: {
                      fill: isHovered
                        ? "#6f5d43"
                        : country
                          ? "#8f7b57"
                          : "#d9d7d1",
                      outline: "none",
                      transition: "all 220ms ease",
                    },
                    hover: {
                      fill: country ? "#6f5d43" : "#c8c2b7",
                      outline: "none",
                    },
                    pressed: {
                      fill: "#5d4d37",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/55 px-3 py-2 text-xs font-medium text-stone-700 shadow backdrop-blur-sm">
        Hover a country and click for preview
      </div>

      {modalCountry ? (
        <div className="absolute bottom-4 right-4 w-full max-w-sm rounded-2xl border border-white/40 bg-white/40 p-4 shadow-2xl backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-stone-900">{modalCountry.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-stone-700">
            {modalCountry.description ??
              "Open this destination for detailed ratings, wonders, specialists, and route combinations."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/countries/${modalCountry.slug}`}
              className="rounded-lg bg-[#6f5d43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5d4d37]"
            >
              Plan Your Trip
            </Link>
            <button
              type="button"
              onClick={() => setModalCountry(null)}
              className="rounded-lg border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
