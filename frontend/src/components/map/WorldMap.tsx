"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { stripRichText, type CountrySummary } from "@/lib/api";

interface WorldMapProps {
  countries: CountrySummary[];
}

interface GeographyLike {
  rsmKey: string;
  id?: string | number;
  properties?: Record<string, unknown>;
}

interface HoverTooltipState {
  x: number;
  y: number;
  country: CountrySummary;
}

const geographyUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const hikingPalette = ["#2A3A32", "#315042", "#3C664E", "#467B5A", "#4E8C5D"];
const roadtripPalette = ["#5B4037", "#714B3D", "#875542", "#9C5F46", "#B26B4A"];

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

function formatScore(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function isoCodeToFlag(isoCode?: string): string {
  if (!isoCode || isoCode.length !== 2) return "🌍";
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function getStayWindow(country: CountrySummary): string {
  if (country.minDays && country.optimalDays) {
    return `${country.minDays}-${country.optimalDays} days`;
  }
  if (country.optimalDays) return `${country.optimalDays} days`;
  if (country.minDays) return `${country.minDays}+ days`;
  return "Flexible";
}

function getEvocativeLine(country: CountrySummary): string {
  const cleaned = stripRichText(country.description);
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length >= 24) {
    return firstSentence;
  }

  const hiking = country.hikingLevel ?? 0;
  const roadtrip = country.roadtripLevel ?? 0;
  if (hiking >= 4 && roadtrip >= 4) {
    return "Volcanoes, alpine peaks & long, cinematic coastlines";
  }
  if (hiking >= 4) {
    return "Mountain ridgelines, pine forests & remote summit routes";
  }
  if (roadtrip >= 4) {
    return "Sweeping highway arcs, canyon roads & hidden villages";
  }
  return "Curated routes, local stories & signature wild landscapes";
}

function toPaletteColor(score: number, palette: string[]): string {
  const clamped = Math.max(1, Math.min(5, Math.round(score)));
  return palette[clamped - 1] ?? palette[0];
}

function getCountryFill(country: CountrySummary | undefined, isActive: boolean): string {
  if (isActive) return "#5DA9E9";
  if (!country) return "#39403D";

  const hiking = country.hikingLevel;
  const roadtrip = country.roadtripLevel;
  if (!hiking && !roadtrip) {
    return "#4A504D";
  }

  if ((hiking ?? 0) >= (roadtrip ?? 0)) {
    return toPaletteColor(hiking ?? 3, hikingPalette);
  }

  return toPaletteColor(roadtrip ?? 3, roadtripPalette);
}

export function WorldMap({ countries }: WorldMapProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null);
  const [tooltip, setTooltip] = useState<HoverTooltipState | null>(null);

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

  const selectedSlug = selectedCountry?.slug;
  const planTripHref = selectedCountry
    ? `/countries/${selectedCountry.slug}`
    : "/specialists";

  const featureCards = selectedCountry
    ? [
        {
          title: "Best Hike",
          subtitle:
            selectedCountry.hikingLevel && selectedCountry.hikingLevel >= 4
              ? "Iconic ridge-to-coast traverse"
              : "Locally-loved summit day route",
        },
        {
          title: "Best Roadtrip",
          subtitle:
            selectedCountry.roadtripLevel && selectedCountry.roadtripLevel >= 4
              ? "Scenic loop with dramatic viewpoints"
              : "Hidden villages and panoramic passes",
        },
        {
          title: "Signature Landscape",
          subtitle: "The terrain this destination is known for",
        },
      ]
    : [];

  return (
    <section className="relative h-[100dvh] min-h-[680px] w-full overflow-hidden bg-[#1F2624]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(120, 160, 142, 0.12), transparent 45%), radial-gradient(circle at 80% 75%, rgba(95, 75, 63, 0.18), transparent 40%), repeating-linear-gradient(30deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 13px), repeating-linear-gradient(-30deg, rgba(20,25,22,0.35) 0, rgba(20,25,22,0.35) 1px, transparent 1px, transparent 16px)",
        }}
      />

      <ComposableMap
        projectionConfig={{ scale: 154 }}
        className="relative z-10 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geographyUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geography = geo as unknown as GeographyLike;
              const country = resolveCountry(geography);
              const isHovered = hoveredSlug === country?.slug;
              const isSelected = selectedSlug === country?.slug;
              const isActive = isHovered || isSelected;

              return (
                <Geography
                  key={geography.rsmKey}
                  geography={geo}
                  onMouseEnter={(event) => {
                    if (!country) return;
                    setHoveredSlug(country.slug);
                    setTooltip({
                      x: event.clientX,
                      y: event.clientY,
                      country,
                    });
                  }}
                  onMouseMove={(event) => {
                    if (!country) return;
                    setTooltip({
                      x: event.clientX,
                      y: event.clientY,
                      country,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredSlug(null);
                    setTooltip(null);
                  }}
                  onClick={() => {
                    if (country) {
                      setSelectedCountry(country);
                    }
                  }}
                  style={{
                    default: {
                      fill: getCountryFill(country, isActive),
                      stroke: isActive ? "#91C7EE" : "#26302C",
                      strokeWidth: isActive ? 1.1 : 0.55,
                      outline: "none",
                      filter: isActive
                        ? "drop-shadow(0 0 8px rgba(93, 169, 233, 0.65))"
                        : "none",
                      transition: "all 220ms ease",
                    },
                    hover: {
                      fill: country ? "#5DA9E9" : "#515855",
                      stroke: country ? "#A5D1F1" : "#3A4340",
                      strokeWidth: 1.1,
                      outline: "none",
                    },
                    pressed: {
                      fill: country ? "#4A90CC" : "#4C5350",
                      stroke: "#89B8DD",
                      strokeWidth: 1.1,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 px-4 pt-4 md:px-7 md:pt-6">
        <nav className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/14 bg-[#1A1E1CCC] px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[20px] md:px-6">
          <div className="text-sm font-semibold tracking-tight text-[#F0F2F0] md:text-base">
            Adventure Atlas
          </div>
          <div className="flex items-center gap-4 text-xs text-[#B8C0BA] md:gap-7 md:text-sm">
            <Link className="transition hover:text-[#F0F2F0]" href="#overview">
              Overview
            </Link>
            <Link className="transition hover:text-[#F0F2F0]" href="#about">
              About
            </Link>
            <Link className="transition hover:text-[#F0F2F0]" href="#journal">
              Journal
            </Link>
            <Link className="transition hover:text-[#F0F2F0]" href="/specialists">
              Profile
            </Link>
          </div>
        </nav>
      </header>

      <div className="pointer-events-none absolute left-4 top-24 z-30 rounded-xl border border-white/12 bg-[#1A1E1CCC] px-3 py-2 text-[11px] font-medium tracking-wide text-[#A9B2AC] backdrop-blur-[20px] md:left-7 md:top-24">
        Hover to preview - click to open country profile
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 w-52 rounded-xl border border-white/14 bg-[#1A1E1CCC] p-3 text-xs text-[#E5E9E6] shadow-[0_18px_35px_rgba(0,0,0,0.42)] backdrop-blur-[20px]"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y + 14,
          }}
        >
          <p className="font-medium tracking-tight">{tooltip.country.name}</p>
          <p className="mt-1 text-[#B5C0B7]">
            Hiking {formatScore(tooltip.country.hikingLevel)} / 5 · Roadtrip{" "}
            {formatScore(tooltip.country.roadtripLevel)} / 5
          </p>
        </div>
      ) : null}

      <aside
        className={`absolute bottom-6 left-6 top-24 z-40 hidden w-[min(40vw,30rem)] flex-col rounded-2xl border border-white/14 bg-[#1A1E1CCC] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.45)] backdrop-blur-[20px] transition-all duration-500 md:flex ${
          selectedCountry
            ? "translate-x-0 opacity-100"
            : "-translate-x-[120%] opacity-0 pointer-events-none"
        }`}
      >
        {selectedCountry ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium tracking-tight text-[#F0F2F0]">
                  {isoCodeToFlag(selectedCountry.isoCode)} {selectedCountry.name}
                </p>
                <p className="text-sm text-[#B7C1BA]">{getEvocativeLine(selectedCountry)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="rounded-full border border-white/18 px-2 py-1 text-xs text-[#B7C1BA] transition hover:border-white/30 hover:text-[#F0F2F0]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/12 bg-black/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#A8B2AB]">Hiking</p>
                <p className="mt-1 text-lg font-medium text-[#F0F2F0]">
                  {formatScore(selectedCountry.hikingLevel)}/5
                </p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#A8B2AB]">
                  Roadtrip
                </p>
                <p className="mt-1 text-lg font-medium text-[#F0F2F0]">
                  {formatScore(selectedCountry.roadtripLevel)}/5
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/12 bg-black/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#A8B2AB]">
                  Optimal stay
                </p>
                <p className="mt-1 text-lg font-medium text-[#F0F2F0]">
                  {getStayWindow(selectedCountry)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {featureCards.map((item) => (
                <article
                  key={item.title}
                  className="group grid grid-cols-[92px_1fr] gap-3 rounded-xl border border-white/10 bg-black/10 p-2"
                >
                  {selectedCountry.heroImage?.url ? (
                    <img
                      src={selectedCountry.heroImage.url}
                      alt={selectedCountry.heroImage.alternativeText ?? selectedCountry.name}
                      className="h-20 w-[92px] rounded-lg object-cover saturate-[0.88]"
                    />
                  ) : (
                    <div className="h-20 w-[92px] rounded-lg bg-gradient-to-br from-[#345046] to-[#1E2623]" />
                  )}
                  <div className="self-center">
                    <p className="text-sm font-medium text-[#E9ECEA]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#AEB9B1]">{item.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/countries/${selectedCountry.slug}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#4E8C5D] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(78,140,93,0.45)] transition hover:bg-[#5a9c6a]"
              >
                Explore Country
              </Link>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#B5C0B7]">
                <Link
                  href="/specialists?type=community_leader"
                  className="transition hover:text-[#F0F2F0]"
                >
                  See Community Trips
                </Link>
                <Link href="/specialists" className="transition hover:text-[#F0F2F0]">
                  Talk to Specialist
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </aside>

      <div
        className={`absolute inset-x-0 bottom-0 z-40 rounded-t-3xl border border-white/14 bg-[#1A1E1CE6] px-5 pb-6 pt-4 shadow-[0_-24px_50px_rgba(0,0,0,0.45)] backdrop-blur-[20px] transition-transform duration-500 md:hidden ${
          selectedCountry ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        {selectedCountry ? (
          <>
            <div className="mx-auto h-1.5 w-14 rounded-full bg-white/20" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-base font-medium text-[#F0F2F0]">
                {isoCodeToFlag(selectedCountry.isoCode)} {selectedCountry.name}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="rounded-full border border-white/18 px-2 py-1 text-xs text-[#B7C1BA]"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-[#B7C1BA]">{getEvocativeLine(selectedCountry)}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#C5CEC8]">
              <span className="rounded-full border border-white/12 bg-black/10 px-2 py-1">
                Hiking {formatScore(selectedCountry.hikingLevel)}/5
              </span>
              <span className="rounded-full border border-white/12 bg-black/10 px-2 py-1">
                Roadtrip {formatScore(selectedCountry.roadtripLevel)}/5
              </span>
              <span className="rounded-full border border-white/12 bg-black/10 px-2 py-1">
                {getStayWindow(selectedCountry)}
              </span>
            </div>
            <Link
              href={`/countries/${selectedCountry.slug}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#4E8C5D] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(78,140,93,0.45)]"
            >
              Explore
            </Link>
          </>
        ) : null}
      </div>

      <Link
        href={planTripHref}
        className="absolute bottom-7 left-1/2 z-30 hidden -translate-x-1/2 items-center justify-center rounded-full bg-[#4E8C5D] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(78,140,93,0.45)] transition hover:bg-[#5B9C69] md:inline-flex"
      >
        🧭 Plan My Trip
      </Link>

      <Link
        href={planTripHref}
        aria-label="Plan my trip"
        className="absolute bottom-6 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#4E8C5D] text-2xl text-white shadow-[0_12px_28px_rgba(78,140,93,0.5)] md:hidden"
      >
        🧭
      </Link>
    </section>
  );
}
