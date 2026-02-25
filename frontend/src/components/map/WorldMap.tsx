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
type SourceId = string;

interface FeatureRef {
  sourceId: SourceId;
  id: FeatureId;
}

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
  __displayName?: string;
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
    source?: unknown;
    properties?: unknown;
  }>;
}

const geographyUrl =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
const admin1GeographyUrl =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";

const WORLD_SOURCE_ID = "world-countries";
const ADMIN1_SOURCE_ID = "admin1-states-provinces";
const WORLD_FILL_LAYER_ID = "world-countries-fill";
const WORLD_AVAILABLE_GLOW_LAYER_ID = "world-countries-available-glow";
const WORLD_SELECTION_GLOW_LAYER_ID = "world-countries-selection-glow";
const WORLD_STROKE_LAYER_ID = "world-countries-stroke";
const WORLD_LABEL_LAYER_ID = "world-countries-labels";
const ADMIN1_FILL_LAYER_ID = "admin1-fill";
const ADMIN1_STROKE_LAYER_ID = "admin1-stroke";
const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? "mapbox://styles/mapbox/dark-v11";
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const COUNTRY_DEFAULT_FILL = "#354038";
const COUNTRY_ACTIVE_FILL = "#D99E6B";
const COUNTRY_SELECTED_FILL = "#E8BC8F";
const COUNTRY_HOVER_FILL = "#E3B280";
const supportedLanguages = ["en", "cs"] as const;
const fallbackLanguage = "cs";
const mapLanguageToIntlLocale: Record<(typeof supportedLanguages)[number], string> = {
  en: "en",
  cs: "cs-CZ",
};

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

const worldLabelLayer: LayerProps = {
  id: WORLD_LABEL_LAYER_ID,
  type: "symbol",
  minzoom: 1.1,
  layout: {
    "text-field": "{__displayName}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
    "text-size": ["interpolate", ["linear"], ["zoom"], 1.1, 8, 3.2, 13],
    "text-letter-spacing": 0.02,
    "text-max-width": 8.5,
    "text-allow-overlap": false,
  },
  paint: {
    "text-color": "#D9E1DB",
    "text-halo-color": "rgba(14, 18, 16, 0.82)",
    "text-halo-width": 1,
    "text-opacity": 0.82,
  },
};

const admin1FillLayer: LayerProps = {
  id: ADMIN1_FILL_LAYER_ID,
  type: "fill",
  filter: ["==", ["get", "__isAvailable"], true],
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      COUNTRY_SELECTED_FILL,
      ["boolean", ["feature-state", "isHovered"], false],
      COUNTRY_HOVER_FILL,
      COUNTRY_ACTIVE_FILL,
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      0.82,
      ["boolean", ["feature-state", "isHovered"], false],
      0.76,
      0.68,
    ],
  },
};

const admin1StrokeLayer: LayerProps = {
  id: ADMIN1_STROKE_LAYER_ID,
  type: "line",
  filter: ["==", ["get", "__isAvailable"], true],
  paint: {
    "line-color": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      "#F3D7AE",
      ["boolean", ["feature-state", "isHovered"], false],
      "#D8AE80",
      "#B27B4C",
    ],
    "line-width": [
      "case",
      ["boolean", ["feature-state", "isSelected"], false],
      1.7,
      ["boolean", ["feature-state", "isHovered"], false],
      1.2,
      0.9,
    ],
    "line-opacity": 0.9,
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

function normalizeIso2Code(value: string): string | undefined {
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

function normalizeSubdivisionCode(value: string): string | undefined {
  const normalized = value.trim().toUpperCase().replace(/\./g, "-");
  return /^[A-Z]{2}-[A-Z0-9]{1,4}$/.test(normalized) ? normalized : undefined;
}

function createRegionDisplayNames(locale: (typeof supportedLanguages)[number]): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([mapLanguageToIntlLocale[locale]], {
      type: "region",
    });
  } catch {
    return null;
  }
}

function resolveFeatureDisplayName(
  properties: Record<string, unknown>,
  country: CountrySummary | undefined,
  regionDisplayNames: Intl.DisplayNames | null,
): string {
  if (country?.name) {
    return country.name;
  }

  const iso2Code = normalizeIso2Code(
    getProperty(properties, ["ISO3166-1-Alpha-2", "iso_a2", "ISO_A2"]),
  );
  if (iso2Code && regionDisplayNames) {
    const localizedName = regionDisplayNames.of(iso2Code);
    if (typeof localizedName === "string" && localizedName.trim().length > 0) {
      return localizedName;
    }
  }

  return getProperty(properties, ["name", "NAME", "admin", "ADMIN"]);
}

function getAliasNames(country: CountrySummary): string[] {
  return [country.name, country.nameEn, country.nameCs].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
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

function resolveStateFromProperties(
  properties: Record<string, unknown>,
  statesByIsoSubdivision: Map<string, CountrySummary>,
  statesByCountryAndName: Map<string, CountrySummary>,
  statesByName: Map<string, CountrySummary>,
): CountrySummary | undefined {
  const subdivisionCode = normalizeSubdivisionCode(
    getProperty(properties, ["iso_3166_2", "code_hasc"]),
  );
  if (subdivisionCode && statesByIsoSubdivision.has(subdivisionCode)) {
    return statesByIsoSubdivision.get(subdivisionCode);
  }

  const countryIso = normalizeIso2Code(getProperty(properties, ["iso_a2", "ISO_A2"]));
  const subdivisionName = getProperty(properties, ["name_en", "name", "name_local"]);
  if (countryIso && subdivisionName) {
    const key = `${countryIso}|${normalizeCountryKey(subdivisionName)}`;
    if (statesByCountryAndName.has(key)) {
      return statesByCountryAndName.get(key);
    }
  }

  if (subdivisionName) {
    return statesByName.get(normalizeCountryKey(subdivisionName));
  }

  return undefined;
}

function isCountryFeatureAvailable(
  country: CountrySummary | undefined,
): boolean {
  if (!country) return false;
  return country.enabled === true && hasCountryContent(country);
}

function pickFeatureCountry(country: CountrySummary | undefined): CountrySummary | undefined {
  if (!country) return undefined;
  return country.enabled === true && hasCountryContent(country) ? country : undefined;
}

function toFeatureRef(
  source: unknown,
  id: unknown,
): FeatureRef | null {
  if (
    (source === WORLD_SOURCE_ID || source === ADMIN1_SOURCE_ID) &&
    isFeatureId(id)
  ) {
    return {
      sourceId: source,
      id,
    };
  }
  return null;
}

function toFeatureRefKey(reference: FeatureRef): string {
  return `${reference.sourceId}:${String(reference.id)}`;
}

export function WorldMap({ countries, initialView = "map", locale }: WorldMapProps) {
  const dictionary = getDictionary(locale);
  const mapLanguage =
    supportedLanguages.includes(locale) ? locale : fallbackLanguage;
  const regionDisplayNames = useMemo(
    () => createRegionDisplayNames(mapLanguage),
    [mapLanguage],
  );
  const enabledCountries = useMemo(
    () => countries.filter((country) => country.enabled === true),
    [countries],
  );
  const allTopLevelCountries = useMemo(
    () => countries.filter((country) => country.isState !== true),
    [countries],
  );
  const enabledStates = useMemo(
    () => enabledCountries.filter((country) => country.isState === true),
    [enabledCountries],
  );
  const topLevelCountriesById = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    allTopLevelCountries.forEach((country) => {
      map.set(String(country.id), country);
    });
    return map;
  }, [allTopLevelCountries]);
  const availableStates = useMemo(
    () => enabledStates.filter((state) => hasCountryContent(state)),
    [enabledStates],
  );
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null);
  const [tooltip, setTooltip] = useState<HoverTooltipState | null>(null);
  const [rawWorldGeoJson, setRawWorldGeoJson] = useState<WorldGeoJson | null>(null);
  const [rawAdmin1GeoJson, setRawAdmin1GeoJson] = useState<WorldGeoJson | null>(null);
  const [hoveredFeatureRef, setHoveredFeatureRef] = useState<FeatureRef | null>(null);
  const [selectedFeatureRef, setSelectedFeatureRef] = useState<FeatureRef | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">(initialView);
  const mapRef = useRef<MapRef | null>(null);
  const languageControlRef = useRef<MapboxLanguage | null>(null);
  const highlightedFeatureRefsRef = useRef<Map<string, FeatureRef>>(new Map());
  const lastTouchInteractionAtRef = useRef(0);

  const countriesByName = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    allTopLevelCountries.forEach((country) => {
      getAliasNames(country).forEach((alias) => {
        const key = normalizeCountryKey(alias);
        if (!map.has(key)) {
          map.set(key, country);
        }
      });
    });
    return map;
  }, [allTopLevelCountries]);

  const countriesByIso = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    allTopLevelCountries.forEach((country) => {
      if (country.isoCode) {
        map.set(country.isoCode.toLowerCase(), country);
      }
    });
    return map;
  }, [allTopLevelCountries]);

  const statesByIsoSubdivision = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    availableStates.forEach((state) => {
      const parentId = state.parentCountryId;
      if (typeof parentId === "undefined" || parentId === null) {
        return;
      }
      const parentCountry = topLevelCountriesById.get(String(parentId));
      const parentIso = parentCountry?.isoCode?.toUpperCase();
      const stateIso = state.isoCode?.toUpperCase();
      if (!parentIso || !stateIso) {
        return;
      }

      map.set(`${parentIso}-${stateIso}`, state);
      map.set(`${parentIso}.${stateIso}`, state);
    });
    return map;
  }, [availableStates, topLevelCountriesById]);

  const statesByCountryAndName = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    availableStates.forEach((state) => {
      const parentId = state.parentCountryId;
      if (typeof parentId === "undefined" || parentId === null) {
        return;
      }
      const parentCountry = topLevelCountriesById.get(String(parentId));
      const parentIso = parentCountry?.isoCode?.toUpperCase();
      if (!parentIso) {
        return;
      }

      getAliasNames(state).forEach((alias) => {
        const key = `${parentIso}|${normalizeCountryKey(alias)}`;
        if (!map.has(key)) {
          map.set(key, state);
        }
      });
    });
    return map;
  }, [availableStates, topLevelCountriesById]);

  const statesByName = useMemo(() => {
    const map = new Map<string, CountrySummary>();
    availableStates.forEach((state) => {
      getAliasNames(state).forEach((alias) => {
        const key = normalizeCountryKey(alias);
        if (!map.has(key)) {
          map.set(key, state);
        }
      });
    });
    return map;
  }, [availableStates]);

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
      setHoveredFeatureRef(null);
      setSelectedFeatureRef(null);
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

  useEffect(() => {
    let isCancelled = false;

    async function loadAdmin1GeoJson(): Promise<void> {
      try {
        const response = await fetch(admin1GeographyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch admin1 GeoJSON (${response.status})`);
        }

        const payload = (await response.json()) as Partial<WorldGeoJson>;
        if (payload.type !== "FeatureCollection" || !Array.isArray(payload.features)) {
          throw new Error("Invalid admin1 GeoJSON payload");
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
          setRawAdmin1GeoJson(normalized);
        }
      } catch (error) {
        console.error("Unable to load admin1 map data", error);
        if (!isCancelled) {
          setRawAdmin1GeoJson({
            type: "FeatureCollection",
            features: [],
          });
        }
      }
    }

    void loadAdmin1GeoJson();

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
        const selectionCountry = pickFeatureCountry(matchedCountry);
        const isAvailable = isCountryFeatureAvailable(matchedCountry);

        return {
          ...feature,
          properties: {
            ...properties,
            __countrySlug: selectionCountry?.slug ?? matchedCountry?.slug,
            __isAvailable: isAvailable,
            __fillColor: getFeatureFill(isAvailable),
            __displayName: resolveFeatureDisplayName(
              properties,
              matchedCountry,
              regionDisplayNames,
            ),
          },
        } as WorldFeature;
      }),
    };
  }, [rawWorldGeoJson, countriesByIso, countriesByName, regionDisplayNames]);

  const admin1GeoJson = useMemo<WorldGeoJson | null>(() => {
    if (!rawAdmin1GeoJson) return null;

    return {
      type: "FeatureCollection",
      features: rawAdmin1GeoJson.features.map((feature) => {
        const properties = asRecord(feature.properties) as MapFeatureProperties;
        const matchedState = resolveStateFromProperties(
          properties,
          statesByIsoSubdivision,
          statesByCountryAndName,
          statesByName,
        );
        const isAvailable = Boolean(matchedState);

        return {
          ...feature,
          properties: {
            ...properties,
            __countrySlug: matchedState?.slug,
            __isAvailable: isAvailable,
            __fillColor: getFeatureFill(isAvailable),
            __displayName:
              matchedState?.name ??
              getProperty(properties, ["name_en", "name", "name_local"]),
          },
        } as WorldFeature;
      }),
    };
  }, [rawAdmin1GeoJson, statesByIsoSubdivision, statesByCountryAndName, statesByName]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !isMapReady || !worldGeoJson) {
      return;
    }

    const nextHighlightedRefs = new Map<string, FeatureRef>();
    if (hoveredFeatureRef) {
      nextHighlightedRefs.set(toFeatureRefKey(hoveredFeatureRef), hoveredFeatureRef);
    }
    if (selectedFeatureRef) {
      nextHighlightedRefs.set(toFeatureRefKey(selectedFeatureRef), selectedFeatureRef);
    }

    const allTouchedRefs = new Map<string, FeatureRef>(highlightedFeatureRefsRef.current);
    nextHighlightedRefs.forEach((reference, key) => {
      allTouchedRefs.set(key, reference);
    });

    const hoveredKey = hoveredFeatureRef ? toFeatureRefKey(hoveredFeatureRef) : null;
    const selectedKey = selectedFeatureRef ? toFeatureRefKey(selectedFeatureRef) : null;

    allTouchedRefs.forEach((reference, key) => {
      if (!map.getSource(reference.sourceId)) {
        return;
      }
      try {
        map.setFeatureState(
          { source: reference.sourceId, id: reference.id },
          {
            isHovered: key === hoveredKey,
            isSelected: key === selectedKey,
          },
        );
      } catch {
        // Feature may no longer be available after data refresh.
      }
    });

    highlightedFeatureRefsRef.current = nextHighlightedRefs;
  }, [hoveredFeatureRef, selectedFeatureRef, isMapReady, worldGeoJson, admin1GeoJson]);

  useEffect(() => {
    highlightedFeatureRefsRef.current = new Map();
    setHoveredFeatureRef(null);
    setSelectedFeatureRef(null);
    setTooltip(null);
  }, [worldGeoJson, admin1GeoJson]);

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
    if (!map || !isMapReady) {
      return;
    }

    for (const layer of map.getStyle().layers ?? []) {
      if (layer.type !== "symbol" || !layer.id.includes("country-label")) {
        continue;
      }

      if (!map.getLayer(layer.id)) {
        continue;
      }

      try {
        map.setLayoutProperty(layer.id, "visibility", "none");
      } catch {
        // Ignore style mutations while map internals settle.
      }
    }
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
    setHoveredFeatureRef(null);
    setTooltip(null);
  };

  const handleMouseMove = (event: MapMouseEvent) => {
    const feature = event.features?.[0];
    const properties = asRecord(feature?.properties);
    const slug =
      typeof properties.__countrySlug === "string" ? properties.__countrySlug : undefined;

    if (!slug) {
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

    setHoveredFeatureRef(toFeatureRef(feature?.source, feature?.id));

    const pointerEvent = event.originalEvent as MouseEvent;
    setTooltip({
      x: pointerEvent.clientX,
      y: pointerEvent.clientY,
      country,
    });
  };

  const resolveSelectionFromFeature = (
    feature: { id?: unknown; source?: unknown; properties?: unknown } | undefined,
  ): { country: CountrySummary; featureRef: FeatureRef | null } | null => {
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
      featureRef: toFeatureRef(feature?.source, feature?.id),
    };
  };

  const resolveSelectionFromMapInteraction = (
    event: MapInteractionEvent,
  ): { country: CountrySummary; featureRef: FeatureRef | null } | null => {
    const primarySelection = resolveSelectionFromFeature(event.features?.[0]);
    if (primarySelection) {
      return primarySelection;
    }

    const renderedFeatures =
      mapRef.current?.queryRenderedFeatures([event.point.x, event.point.y], {
        layers: [ADMIN1_FILL_LAYER_ID, WORLD_FILL_LAYER_ID],
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
        setSelectedFeatureRef(null);
        setTooltip(null);
      }
      return;
    }

    setSelectedCountry(selection.country);
    setSelectedFeatureRef(selection.featureRef);
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
    setSelectedFeatureRef(null);
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
                interactiveLayerIds={[ADMIN1_FILL_LAYER_ID, WORLD_FILL_LAYER_ID]}
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
                    <Layer {...worldLabelLayer} />
                  </Source>
                ) : null}
                {admin1GeoJson ? (
                  <Source id={ADMIN1_SOURCE_ID} type="geojson" data={admin1GeoJson} generateId>
                    <Layer {...admin1FillLayer} />
                    <Layer {...admin1StrokeLayer} />
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
