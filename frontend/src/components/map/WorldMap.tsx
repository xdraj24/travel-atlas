"use client";

import type { Feature, FeatureCollection, Geometry } from "geojson";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import MapboxMap, {
  Layer,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapTouchEvent,
  type MapRef,
} from "react-map-gl/mapbox";

import { type CountrySummary } from "@/lib/api";
import { CountryPreviewPanel } from "@/components/map/CountryPreviewPanel";

interface WorldMapProps {
  countries: CountrySummary[];
}

type FeatureId = string | number;

interface MapFeatureProperties extends Record<string, unknown> {
  name?: string;
  NAME?: string;
  admin?: string;
  ADMIN?: string;
  iso_a2?: string;
  ISO_A2?: string;
  iso_a3?: string;
  ISO_A3?: string;
  id?: string | number;
  __countrySlug?: string;
  __fillColor?: string;
}

type WorldFeature = Feature<Geometry, MapFeatureProperties>;
type WorldGeoJson = FeatureCollection<Geometry, MapFeatureProperties>;

interface HoverTooltipState {
  x: number;
  y: number;
  country: CountrySummary;
}

interface MapInteractionEvent {
  point: {
    x: number;
    y: number;
  };
  features?: Array<{
    id?: unknown;
    properties?: unknown;
  }>;
}

const geographyUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

const WORLD_SOURCE_ID = "world-countries";
const WORLD_FILL_LAYER_ID = "world-countries-fill";
const WORLD_GLOW_LAYER_ID = "world-countries-glow";
const WORLD_STROKE_LAYER_ID = "world-countries-stroke";
const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? "mapbox://styles/mapbox/dark-v11";
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const COUNTRY_DEFAULT_FILL = "#526044";
const COUNTRY_PRIORITY_FILL = "#9f6a3a";
const COUNTRY_SELECTED_FILL = "#c9a06a";
const COUNTRY_HOVER_FILL = "#647356";

const featuredCountrySlugs = new Set(["norway", "switzerland", "swiss"]);
const featuredCountryIso = new Set(["no", "nor", "ch", "che"]);

const worldFillLayer: LayerProps = {
  id: WORLD_FILL_LAYER_ID,
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      COUNTRY_SELECTED_FILL,
      ["boolean", ["feature-state", "isHovered"], false],
      COUNTRY_HOVER_FILL,
      ["coalesce", ["get", "__fillColor"], COUNTRY_DEFAULT_FILL],
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      0.98,
      ["boolean", ["feature-state", "isHovered"], false],
      0.95,
      0.9,
    ],
  },
};

const worldGlowLayer: LayerProps = {
  id: WORLD_GLOW_LAYER_ID,
  type: "line",
  paint: {
    "line-color": COUNTRY_SELECTED_FILL,
    "line-width": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      6,
      0,
    ],
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      0.45,
      0,
    ],
    "line-blur": 1.6,
  },
};

const worldStrokeLayer: LayerProps = {
  id: WORLD_STROKE_LAYER_ID,
  type: "line",
  paint: {
    "line-color": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      "#F3D7AE",
      ["boolean", ["feature-state", "isHovered"], false],
      "#8E9C8F",
      "#26302C",
    ],
    "line-width": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      1.8,
      ["boolean", ["feature-state", "isHovered"], false],
      1.05,
      0.55,
    ],
    "line-opacity": 0.95,
  },
};

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

function getCountryFill(country: CountrySummary | undefined): string {
  if (!country) return COUNTRY_DEFAULT_FILL;

  const normalizedName = country.name.trim().toLowerCase();
  const normalizedIso = country.isoCode?.trim().toLowerCase() ?? "";
  if (
    featuredCountrySlugs.has(country.slug.trim().toLowerCase()) ||
    featuredCountryIso.has(normalizedIso) ||
    normalizedName.includes("norway") ||
    normalizedName.includes("swiss") ||
    normalizedName.includes("switzerland")
  ) {
    return COUNTRY_PRIORITY_FILL;
  }
  return COUNTRY_DEFAULT_FILL;
}

function isFeatureId(value: unknown): value is FeatureId {
  return typeof value === "string" || typeof value === "number";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function resolveCountryFromProperties(
  properties: Record<string, unknown>,
  countriesByIso: Map<string, CountrySummary>,
  countriesByName: Map<string, CountrySummary>,
): CountrySummary | undefined {
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
}

export function WorldMap({ countries }: WorldMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null);
  const [tooltip, setTooltip] = useState<HoverTooltipState | null>(null);
  const [rawWorldGeoJson, setRawWorldGeoJson] = useState<WorldGeoJson | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<FeatureId | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<FeatureId | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<MapRef | null>(null);
  const highlightedFeatureIdsRef = useRef<Set<FeatureId>>(new Set());
  const lastTouchInteractionAtRef = useRef(0);

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

  const countriesBySlug = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    countries.forEach((country) => {
      map.set(country.slug, country);
    });
    return map;
  }, [countries]);

  useEffect(() => {
    let isCancelled = false;

    async function loadWorldGeoJson(): Promise<void> {
      try {
        const response = await fetch(geographyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch world GeoJSON (${response.status})`);
        }

        const payload = (await response.json()) as Partial<WorldGeoJson>;
        if (payload.type !== "FeatureCollection" || !Array.isArray(payload.features)) {
          throw new Error("Invalid world GeoJSON payload");
        }

        const normalized: WorldGeoJson = {
          type: "FeatureCollection",
          features: payload.features.map((feature, index) => {
            const withId = {
              ...feature,
              id: isFeatureId(feature.id) ? feature.id : index,
              properties: asRecord(feature.properties) as MapFeatureProperties,
            };
            return withId as WorldFeature;
          }),
        };

        if (!isCancelled) {
          setRawWorldGeoJson(normalized);
        }
      } catch (error) {
        console.error("Unable to load world map data", error);
        if (!isCancelled) {
          setRawWorldGeoJson({
            type: "FeatureCollection",
            features: [],
          });
        }
      }
    }

    void loadWorldGeoJson();

    return () => {
      isCancelled = true;
    };
  }, []);

  const worldGeoJson = useMemo<WorldGeoJson | null>(() => {
    if (!rawWorldGeoJson) return null;

    return {
      type: "FeatureCollection",
      features: rawWorldGeoJson.features.map((feature) => {
        const properties = asRecord(feature.properties) as MapFeatureProperties;
        const country = resolveCountryFromProperties(properties, countriesByIso, countriesByName);

        return {
          ...feature,
          properties: {
            ...properties,
            __countrySlug: country?.slug,
            __fillColor: getCountryFill(country),
          },
        } as WorldFeature;
      }),
    };
  }, [rawWorldGeoJson, countriesByIso, countriesByName]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !isMapReady || !map.getSource(WORLD_SOURCE_ID) || !worldGeoJson) {
      return;
    }

    const nextHighlightedIds = new Set<FeatureId>();
    if (hoveredFeatureId !== null) {
      nextHighlightedIds.add(hoveredFeatureId);
    }
    if (selectedFeatureId !== null) {
      nextHighlightedIds.add(selectedFeatureId);
    }

    const allTouchedIds = new Set<FeatureId>([
      ...highlightedFeatureIdsRef.current,
      ...nextHighlightedIds,
    ]);

    allTouchedIds.forEach((id) => {
      try {
        map.setFeatureState(
          { source: WORLD_SOURCE_ID, id },
          {
            isHovered: id === hoveredFeatureId,
            isSelected: id === selectedFeatureId,
          },
        );
      } catch {
        // Feature may no longer be available after data refresh.
      }
    });

    highlightedFeatureIdsRef.current = nextHighlightedIds;
  }, [hoveredFeatureId, selectedFeatureId, isMapReady, worldGeoJson]);

  useEffect(() => {
    highlightedFeatureIdsRef.current = new Set();
    setHoveredFeatureId(null);
    setSelectedFeatureId(null);
    setTooltip(null);
  }, [worldGeoJson]);

  useEffect(() => {
    const currentMap = mapRef.current;
    return () => {
      const canvas = currentMap?.getCanvas();
      if (canvas) {
        canvas.style.cursor = "";
      }
    };
  }, []);

  const clearHoveredCountry = () => {
    const canvas = mapRef.current?.getCanvas();
    if (canvas) {
      canvas.style.cursor = "";
    }
    setHoveredFeatureId(null);
    setTooltip(null);
  };

  const handleMouseMove = (event: MapMouseEvent) => {
    const feature = event.features?.[0];
    const properties = asRecord(feature?.properties);
    const slug =
      typeof properties.__countrySlug === "string" ? properties.__countrySlug : undefined;

    if (!slug || !isFeatureId(feature?.id)) {
      clearHoveredCountry();
      return;
    }

    const country = countriesBySlug.get(slug);
    if (!country) {
      clearHoveredCountry();
      return;
    }

    const canvas = mapRef.current?.getCanvas();
    if (canvas) {
      canvas.style.cursor = "pointer";
    }

    setHoveredFeatureId(feature.id);

    const pointerEvent = event.originalEvent as MouseEvent;
    setTooltip({
      x: pointerEvent.clientX,
      y: pointerEvent.clientY,
      country,
    });
  };

  const resolveSelectionFromFeature = (
    feature: { id?: unknown; properties?: unknown } | undefined,
  ): { country: CountrySummary; featureId: FeatureId | null } | null => {
    const properties = asRecord(feature?.properties);
    const slug =
      typeof properties.__countrySlug === "string" ? properties.__countrySlug : undefined;
    if (!slug) {
      return null;
    }

    const country = countriesBySlug.get(slug);
    if (!country) {
      return null;
    }

    return {
      country,
      featureId: isFeatureId(feature?.id) ? feature.id : null,
    };
  };

  const resolveSelectionFromMapInteraction = (
    event: MapInteractionEvent,
  ): { country: CountrySummary; featureId: FeatureId | null } | null => {
    const primarySelection = resolveSelectionFromFeature(event.features?.[0]);
    if (primarySelection) {
      return primarySelection;
    }

    const renderedFeatures =
      mapRef.current?.queryRenderedFeatures([event.point.x, event.point.y], {
        layers: [WORLD_FILL_LAYER_ID],
      }) ?? [];

    for (const renderedFeature of renderedFeatures) {
      const renderedSelection = resolveSelectionFromFeature(renderedFeature);
      if (renderedSelection) {
        return renderedSelection;
      }
    }

    return null;
  };

  const applyMapSelection = (
    event: MapInteractionEvent,
    options?: { allowRandomFallback?: boolean },
  ) => {
    const selection = resolveSelectionFromMapInteraction(event);
    if (!selection) {
      if (options?.allowRandomFallback && countries.length > 0) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        setSelectedCountry(randomCountry);
        setSelectedFeatureId(null);
        setTooltip(null);
      }
      return;
    }

    setSelectedCountry(selection.country);
    setSelectedFeatureId(selection.featureId);
    setTooltip(null);
  };

  const handleMapClick = (event: MapMouseEvent) => {
    // A touch sequence can trigger a follow-up click; ignore that synthetic click.
    if (Date.now() - lastTouchInteractionAtRef.current < 500) {
      return;
    }
    applyMapSelection(event, { allowRandomFallback: true });
  };

  const handleMapTouchEnd = (event: MapTouchEvent) => {
    lastTouchInteractionAtRef.current = Date.now();
    applyMapSelection(event, { allowRandomFallback: false });
  };

  const clearSelectedCountry = () => {
    setSelectedCountry(null);
    setSelectedFeatureId(null);
  };

  const nudgeZoom = (delta: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(1, Math.min(4, currentZoom + delta));
    map.easeTo({ zoom: targetZoom, duration: 220 });
  };

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

      {mapboxToken ? (
        <div className="relative z-10 h-full w-full">
          <MapboxMap
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
            mapboxAccessToken={mapboxToken}
            mapStyle={mapboxStyle}
            initialViewState={{ longitude: 8, latitude: 22, zoom: 1.45 }}
            minZoom={1}
            maxZoom={4}
            dragRotate={false}
            touchZoomRotate={false}
            renderWorldCopies={false}
            interactiveLayerIds={[WORLD_FILL_LAYER_ID]}
            onLoad={() => setIsMapReady(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={clearHoveredCountry}
            onClick={handleMapClick}
            onTouchEnd={handleMapTouchEnd}
          >
            {worldGeoJson ? (
              <Source id={WORLD_SOURCE_ID} type="geojson" data={worldGeoJson} generateId>
                <Layer {...worldFillLayer} />
                <Layer {...worldGlowLayer} />
                <Layer {...worldStrokeLayer} />
              </Source>
            ) : null}
          </MapboxMap>
        </div>
      ) : (
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
          <div className="max-w-md rounded-2xl border border-white/20 bg-[#1A1E1CCC] p-5 text-sm text-[#D3DCD6] backdrop-blur-[20px]">
            Add <code className="rounded bg-black/30 px-1 py-0.5">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>{" "}
            to enable the interactive map.
          </div>
        </div>
      )}

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
        Hover to preview - click anywhere to build a trip plan
      </div>

      <div className="absolute right-4 top-24 z-30 flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#1A1E1CCC] shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-[20px] md:right-7 md:top-24">
        <button
          type="button"
          onClick={() => nudgeZoom(0.55)}
          className="h-10 w-10 text-lg font-semibold text-[#E8ECE9] transition hover:bg-white/10"
          aria-label="Zoom in"
        >
          +
        </button>
        <div className="h-px bg-white/10" />
        <button
          type="button"
          onClick={() => nudgeZoom(-0.55)}
          className="h-10 w-10 text-lg font-semibold text-[#E8ECE9] transition hover:bg-white/10"
          aria-label="Zoom out"
        >
          −
        </button>
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

      {selectedCountry ? (
        <>
          <button
            type="button"
            aria-label="Close country preview"
            onPointerDown={clearSelectedCountry}
            className="absolute inset-0 z-40 bg-black/10 md:hidden"
          />
          <CountryPreviewPanel country={selectedCountry} onClose={clearSelectedCountry} />
        </>
      ) : null}
    </section>
  );
}
