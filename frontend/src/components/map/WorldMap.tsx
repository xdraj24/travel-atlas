"use client";

import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { DataDrivenPropertyValueSpecification } from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
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
import { getDictionary } from "@/lib/dictionary";
import { type AppLocale } from "@/lib/locale";

interface WorldMapProps {
  countries: CountrySummary[];
  initialView?: "map" | "list";
  locale: AppLocale;
}

type FeatureId = string | number;

interface MapFeatureProperties extends Record<string, unknown> {
  name?: string;
  NAME?: string;
  admin?: string;
  ADMIN?: string;
  "ISO3166-1-Alpha-2"?: string;
  "ISO3166-1-Alpha-3"?: string;
  iso_a2?: string;
  ISO_A2?: string;
  iso_a3?: string;
  ISO_A3?: string;
  id?: string | number;
  __countrySlug?: string;
  __fillColor?: string;
  __isAvailable?: boolean;
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
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const WORLD_SOURCE_ID = "world-countries";
const WORLD_FILL_LAYER_ID = "world-countries-fill";
const WORLD_AVAILABLE_GLOW_LAYER_ID = "world-countries-available-glow";
const WORLD_SELECTION_GLOW_LAYER_ID = "world-countries-selection-glow";
const WORLD_STROKE_LAYER_ID = "world-countries-stroke";
const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? "mapbox://styles/mapbox/dark-v11";
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const COUNTRY_DEFAULT_FILL = "#354038";
const COUNTRY_ACTIVE_FILL = "#D99E6B";
const COUNTRY_SELECTED_FILL = "#E8BC8F";
const COUNTRY_HOVER_FILL = "#E3B280";
const supportedLanguages = ["en", "cs"] as const;
const fallbackLanguage = "cs";

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
      ["boolean", ["get", "__isAvailable"], false],
      COUNTRY_ACTIVE_FILL,
      ["coalesce", ["get", "__fillColor"], COUNTRY_DEFAULT_FILL],
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      0.98,
      ["boolean", ["feature-state", "isHovered"], false],
      0.95,
      ["boolean", ["get", "__isAvailable"], false],
      0.93,
      0.78,
    ],
  },
};

const worldAvailabilityGlowLayer: LayerProps = {
  id: WORLD_AVAILABLE_GLOW_LAYER_ID,
  type: "line",
  filter: ["==", ["get", "__isAvailable"], true],
  paint: {
    "line-color": COUNTRY_ACTIVE_FILL,
    "line-width": 1.8,
    "line-opacity": 0.28,
    "line-blur": 2.4,
  },
};

const worldSelectionGlowLayer: LayerProps = {
  id: WORLD_SELECTION_GLOW_LAYER_ID,
  type: "line",
  paint: {
    "line-color": COUNTRY_SELECTED_FILL,
    "line-width": ["case", ["boolean", ["feature-state", "isSelected"], false], 5.5, 0],
    "line-opacity": ["case", ["boolean", ["feature-state", "isSelected"], false], 0.42, 0],
    "line-blur": 1.4,
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

function hasCountryContent(country: CountrySummary | undefined): boolean {
  if (!country) return false;

  const hasDescription = typeof country.description === "string" && country.description.trim().length > 0;
  const hasImage = Boolean(country.heroImage?.url);
  const hasWonders = (country.wonders?.length ?? 0) > 0;
  const hasExperienceScores =
    typeof country.hikingLevel === "number" ||
    typeof country.roadtripLevel === "number" ||
    typeof country.beachLevel === "number";
  const hasPlanningData =
    typeof country.minDays === "number" ||
    typeof country.optimalDays === "number" ||
    typeof country.avgAccommodationPrice === "number";

  return hasDescription || hasImage || hasWonders || hasExperienceScores || hasPlanningData;
}

function getFeatureFill(isAvailable: boolean): string {
  return isAvailable ? COUNTRY_ACTIVE_FILL : COUNTRY_DEFAULT_FILL;
}

function getCountryRegionLabel(
  country: CountrySummary,
  labels: {
    country: string;
    regional: string;
  },
): string {
  return country.isState ? labels.regional : labels.country;
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
    "ISO3166-1-Alpha-2",
    "ISO3166-1-Alpha-3",
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

function getStatesForCountry(
  country: CountrySummary | undefined,
  statesByParentId: Map<string, CountrySummary[]>,
): CountrySummary[] {
  if (!country) return [];
  return statesByParentId.get(String(country.id)) ?? [];
}

function isCountryFeatureAvailable(
  country: CountrySummary | undefined,
  statesByParentId: Map<string, CountrySummary[]>,
): boolean {
  if (!country) return false;
  if (hasCountryContent(country)) return true;
  return getStatesForCountry(country, statesByParentId).some((state) => hasCountryContent(state));
}

function pickFeatureCountry(
  country: CountrySummary | undefined,
  statesByParentId: Map<string, CountrySummary[]>,
): CountrySummary | undefined {
  if (!country) return undefined;
  if (hasCountryContent(country)) return country;

  const firstStateWithContent = getStatesForCountry(country, statesByParentId)
    .filter((state) => hasCountryContent(state))
    .sort((left, right) => left.name.localeCompare(right.name))[0];

  return firstStateWithContent ?? country;
}

export function WorldMap({ countries, initialView = "map", locale }: WorldMapProps) {
  const dictionary = getDictionary(locale);
  const mapLanguage =
    supportedLanguages.includes(locale) ? locale : fallbackLanguage;
  const enabledCountries = useMemo(
    () => countries.filter((country) => country.enabled === true),
    [countries],
  );
  const enabledTopLevelCountries = useMemo(
    () => enabledCountries.filter((country) => country.isState !== true),
    [enabledCountries],
  );
  const enabledStates = useMemo(
    () => enabledCountries.filter((country) => country.isState === true),
    [enabledCountries],
  );
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null);
  const [tooltip, setTooltip] = useState<HoverTooltipState | null>(null);
  const [rawWorldGeoJson, setRawWorldGeoJson] = useState<WorldGeoJson | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<FeatureId | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<FeatureId | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">(initialView);
  const mapRef = useRef<MapRef | null>(null);
  const languageControlRef = useRef<MapboxLanguage | null>(null);
  const highlightedFeatureIdsRef = useRef<Set<FeatureId>>(new Set());
  const lastTouchInteractionAtRef = useRef(0);

  const countriesByName = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    enabledTopLevelCountries.forEach((country) => {
      const aliases = [country.name, country.nameEn, country.nameCs];
      aliases.forEach((alias) => {
        if (typeof alias === "string" && alias.trim().length > 0) {
          map.set(normalizeCountryKey(alias), country);
        }
      });
    });
    return map;
  }, [enabledTopLevelCountries]);

  const countriesByIso = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    enabledTopLevelCountries.forEach((country) => {
      if (country.isoCode) {
        map.set(country.isoCode.toLowerCase(), country);
      }
    });
    return map;
  }, [enabledTopLevelCountries]);

  const statesByParentId = useMemo(() => {
    const map = new Map<string, CountrySummary[]>();
    enabledStates.forEach((state) => {
      if (typeof state.parentCountryId === "undefined" || state.parentCountryId === null) {
        return;
      }
      const key = String(state.parentCountryId);
      const existing = map.get(key);
      if (existing) {
        existing.push(state);
      } else {
        map.set(key, [state]);
      }
    });
    return map;
  }, [enabledStates]);

  const countriesBySlug = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    enabledCountries.forEach((country) => {
      map.set(country.slug, country);
    });
    return map;
  }, [enabledCountries]);

  const listCountries = useMemo(() => {
    const available = enabledCountries.filter((country) => hasCountryContent(country));
    return (available.length > 0 ? available : enabledCountries).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [enabledCountries]);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  useEffect(() => {
    if (viewMode === "list") {
      setTooltip(null);
      setSelectedCountry(null);
      setHoveredFeatureId(null);
      setSelectedFeatureId(null);
    }
  }, [viewMode]);

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
        const matchedCountry = resolveCountryFromProperties(properties, countriesByIso, countriesByName);
        const selectionCountry = pickFeatureCountry(matchedCountry, statesByParentId);
        const isAvailable = isCountryFeatureAvailable(matchedCountry, statesByParentId);

        return {
          ...feature,
          properties: {
            ...properties,
            __countrySlug: selectionCountry?.slug ?? matchedCountry?.slug,
            __isAvailable: isAvailable,
            __fillColor: getFeatureFill(isAvailable),
          },
        } as WorldFeature;
      }),
    };
  }, [rawWorldGeoJson, countriesByIso, countriesByName, statesByParentId]);

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
    const map = mapRef.current?.getMap();
    if (!map || !isMapReady || languageControlRef.current) {
      return;
    }

    const languageControl = new MapboxLanguage({
      defaultLanguage: fallbackLanguage,
      supportedLanguages: [...supportedLanguages],
    });

    map.addControl(languageControl);
    languageControlRef.current = languageControl;

    return () => {
      if (languageControlRef.current !== languageControl) {
        return;
      }

      try {
        if (map.hasControl(languageControl)) {
          map.removeControl(languageControl);
        }
      } catch {
        // Ignore teardown errors when map is already disposed.
      }
      languageControlRef.current = null;
    };
  }, [isMapReady]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    const languageControl = languageControlRef.current;
    if (!map || !isMapReady || !languageControl) {
      return;
    }

    try {
      const localizedStyle = languageControl.setLanguage(map.getStyle(), mapLanguage);

      for (const layer of localizedStyle.layers) {
        const layout = layer.layout as Record<string, unknown> | undefined;
        const textField = layout?.["text-field"];
        if (typeof textField === "undefined" || textField === null || !map.getLayer(layer.id)) {
          continue;
        }
        map.setLayoutProperty(
          layer.id,
          "text-field",
          textField as DataDrivenPropertyValueSpecification<string>,
        );
      }
    } catch (error) {
      console.error("Unable to update map label language", error);
    }
  }, [isMapReady, mapLanguage]);

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
      if (options?.allowRandomFallback && enabledCountries.length > 0) {
        const randomCountry =
          enabledCountries[Math.floor(Math.random() * enabledCountries.length)];
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
    <section
      id="map"
      className="relative h-[calc(100dvh-5rem)] min-h-[680px] w-full overflow-hidden bg-[#1F2624]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(120, 160, 142, 0.12), transparent 45%), radial-gradient(circle at 80% 75%, rgba(95, 75, 63, 0.18), transparent 40%), repeating-linear-gradient(30deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 13px), repeating-linear-gradient(-30deg, rgba(20,25,22,0.35) 0, rgba(20,25,22,0.35) 1px, transparent 1px, transparent 16px)",
        }}
      />

      {viewMode === "map" ? (
        <>
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
                    <Layer {...worldAvailabilityGlowLayer} />
                    <Layer {...worldSelectionGlowLayer} />
                    <Layer {...worldStrokeLayer} />
                  </Source>
                ) : null}
              </MapboxMap>
            </div>
          ) : (
            <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
              <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[#D3DCD6] backdrop-blur-[20px]">
                {dictionary.worldMap.mapMissingToken}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="relative z-10 h-full overflow-y-auto px-4 pb-24 pt-8 md:px-8">
          <div id="countries" className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listCountries.map((country) => (
              <Link
                key={country.id}
                href={`/countries/${country.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[20px] transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="relative h-52 overflow-hidden">
                  {country.heroImage?.url ? (
                    <img
                      src={country.heroImage.url}
                      alt={country.heroImage.alternativeText ?? country.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#2a332f] to-[#151917]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-[#121614]/55 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-semibold tracking-tighter text-[#F3F5F2]">
                      {country.name}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#C6CEC9]">
                      {getCountryRegionLabel(country, {
                        country: dictionary.worldMap.regionCountry,
                        regional: dictionary.worldMap.regionRegional,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4">
                  <span className="rounded-full border border-white/10 bg-[#4E8C5D]/20 px-3 py-1 text-[11px] font-medium text-[#B9DDC2]">
                    {dictionary.worldMap.hikingLabel} {formatScore(country.hikingLevel)}/5
                  </span>
                  <span className="rounded-full border border-[#D99E6B]/50 bg-[#D99E6B]/18 px-3 py-1 text-[11px] font-medium text-[#F2D2B0]">
                    {dictionary.worldMap.roadtripLabel} {formatScore(country.roadtripLevel)}/5
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#121614]/80 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[20px]">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
              viewMode === "map"
                ? "bg-[#4E8C5D] text-white"
                : "text-[#AEB9B1] hover:bg-white/10 hover:text-[#F0F2F0]"
            }`}
          >
            {dictionary.worldMap.mapTab}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
              viewMode === "list"
                ? "bg-[#D99E6B] text-[#1A1E1C]"
                : "text-[#AEB9B1] hover:bg-white/10 hover:text-[#F0F2F0]"
            }`}
          >
            {dictionary.worldMap.listTab}
          </button>
        </div>
      </div>

      {viewMode === "map" ? (
        <>
          <div className="pointer-events-none absolute left-4 top-6 z-30 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-medium tracking-wide text-[#A9B2AC] backdrop-blur-[20px] md:left-7">
            {dictionary.worldMap.hoverInstruction}
          </div>

          <div className="absolute right-4 top-6 z-30 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-[20px] md:right-7">
            <button
              type="button"
              onClick={() => nudgeZoom(0.55)}
              className="h-10 w-10 text-lg font-semibold text-[#E8ECE9] transition hover:bg-white/10"
              aria-label={dictionary.worldMap.zoomInAria}
            >
              +
            </button>
            <div className="h-px bg-white/10" />
            <button
              type="button"
              onClick={() => nudgeZoom(-0.55)}
              className="h-10 w-10 text-lg font-semibold text-[#E8ECE9] transition hover:bg-white/10"
              aria-label={dictionary.worldMap.zoomOutAria}
            >
              −
            </button>
          </div>

          {tooltip ? (
            <div
              className="pointer-events-none fixed z-50 w-52 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[#E5E9E6] shadow-[0_18px_35px_rgba(0,0,0,0.42)] backdrop-blur-[20px]"
              style={{
                left: tooltip.x + 14,
                top: tooltip.y + 14,
              }}
            >
              <p className="font-medium tracking-tight">{tooltip.country.name}</p>
              <p className="mt-1 text-[#B5C0B7]">
                {dictionary.worldMap.hikingLabel} {formatScore(tooltip.country.hikingLevel)} / 5 ·{" "}
                {dictionary.worldMap.roadtripLabel}{" "}
                {formatScore(tooltip.country.roadtripLevel)} / 5
              </p>
            </div>
          ) : null}

          {selectedCountry ? (
            <>
              <button
                type="button"
                aria-label={dictionary.worldMap.closeCountryPreviewAria}
                onPointerDown={clearSelectedCountry}
                className="absolute inset-0 z-40 bg-black/10 md:hidden"
              />
              <CountryPreviewPanel
                country={selectedCountry}
                onClose={clearSelectedCountry}
                locale={locale}
              />
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
