import { type CountryFilters } from "@/lib/filters";
import { type AppLocale } from "@/lib/locale";

type EntityId = number | string;
type UnknownRecord = Record<string, unknown>;

interface ApiEnvelope<T> {
  data?: T;
}

interface ApiRequestError extends Error {
  status?: number;
  endpoint?: string;
  responseBody?: string;
}

interface ApiFetchOptions {
  revalidate?: number;
}

export interface MediaAsset {
  id?: EntityId;
  url: string;
  alternativeText?: string | null;
}

export interface CountrySummary {
  id: EntityId;
  name: string;
  slug: string;
  isoCode?: string;
  isState?: boolean;
  enabled?: boolean;
  description?: string | null;
  hikingLevel?: number;
  beachLevel?: number;
  roadtripLevel?: number;
  minDays?: number;
  optimalDays?: number;
  avgAccommodationPrice?: number;
  avgFoodPricePerDay?: number;
  pregnancySafe?: boolean;
  infantSafe?: boolean;
  heroImage?: MediaAsset | null;
  wonders?: WonderSummary[];
}

export interface HikeSummary {
  id: EntityId;
  name: string;
  difficulty?: number;
  elevationGain?: number;
  distanceKm?: number;
  durationHours?: number;
  bestSeason?: string;
  description?: string | null;
}

export interface AttractionSummary {
  id: EntityId;
  name: string;
  type?: "beach" | "viewpoint" | "town" | "waterfall";
  description?: string | null;
}

export interface SpecialistSummary {
  id: EntityId;
  name: string;
  slug: string;
  type: "local_advisor" | "community_leader";
  rating?: number;
  languages?: string[];
  offersChat?: boolean;
  offersTrips?: boolean;
  tripPriceFrom?: number;
  whatsappLink?: string | null;
  instagramLink?: string | null;
  profileImage?: MediaAsset | null;
}

export interface WonderSummary {
  id: EntityId;
  name: string;
  slug: string;
  shortDescription?: string | null;
  heroImage?: MediaAsset | null;
  locationLat?: number;
  locationLng?: number;
  hikingDifficulty?: number;
  altitudeMeters?: number;
  pregnancySafe?: boolean;
  infantSafe?: boolean;
}

export interface TripSummary {
  id: EntityId;
  title: string;
  slug: string;
  durationDays?: number;
  price?: number;
  difficulty?: number;
  maxGroupSize?: number;
  description?: string | null;
  startDates?: string[];
}

export interface Country extends CountrySummary {
  avgDirectFlightPrice?: number;
  avgCheapFlightPrice?: number;
  geoJson?: unknown;
  parentCountry?: CountrySummary | null;
  regions?: CountrySummary[];
  bestCombinedWith?: CountrySummary[];
  wonders?: WonderSummary[];
  hikes?: HikeSummary[];
  attractions?: AttractionSummary[];
  specialists?: SpecialistSummary[];
}

export interface Wonder extends WonderSummary {
  fullDescription?: string | null;
  tags?: string[];
  country?: CountrySummary[];
  hikes?: HikeSummary[];
}

export interface Specialist extends SpecialistSummary {
  bio?: string | null;
  country?: CountrySummary | null;
  trips?: TripSummary[];
}

export interface CountryCombination {
  id: EntityId;
  name: string;
  slug: string;
  description?: string | null;
  minDays?: number;
  optimalDays?: number;
  routeDescription?: string | null;
  countries?: CountrySummary[];
}

export const EXAMPLE_FETCH_QUERIES = {
  homepageCountries: "/items/countries",
  filteredCountries:
    "/items/countries?filter[hiking_level][_gte]=3&filter[pregnancy_safe][_eq]=true&filter[avg_cheap_flight_price][_lte]=500",
  countryBySlug: "/api/countries/italy?locale=en",
  wonderBySlug: "/api/wonders/tre-cime-di-lavaredo?locale=en",
} as const;

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

let hasLoggedUrlMismatch = false;

function getBaseUrl(): string {
  const isServer = typeof window === "undefined";
  const serverUrlRaw = process.env.DIRECTUS_URL;
  const publicUrlRaw = process.env.NEXT_PUBLIC_DIRECTUS_URL;

  const serverUrl =
    typeof serverUrlRaw === "string" && serverUrlRaw.trim().length > 0
      ? normalizeUrl(serverUrlRaw)
      : undefined;
  const publicUrl =
    typeof publicUrlRaw === "string" && publicUrlRaw.trim().length > 0
      ? normalizeUrl(publicUrlRaw)
      : undefined;

  const value = isServer ? (serverUrl ?? publicUrl) : (publicUrl ?? serverUrl);

  if (!value) {
    throw new Error(
      "Missing Directus base URL: set DIRECTUS_URL (server) and/or NEXT_PUBLIC_DIRECTUS_URL (client).",
    );
  }

  if (
    isServer &&
    serverUrl &&
    publicUrl &&
    serverUrl !== publicUrl &&
    !hasLoggedUrlMismatch
  ) {
    hasLoggedUrlMismatch = true;
    console.warn(
      `[api] DIRECTUS_URL (${serverUrl}) differs from NEXT_PUBLIC_DIRECTUS_URL (${publicUrl}). Using DIRECTUS_URL for server requests.`,
    );
  }

  return value;
}

function getToken(): string | undefined {
  return (
    process.env.DIRECTUS_ACCESS_TOKEN ??
    process.env.DIRECTUS_TOKEN ??
    process.env.NEXT_PUBLIC_DIRECTUS_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_DIRECTUS_TOKEN
  );
}

async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions: RequestInit & { next?: { revalidate: number } } = {
    headers,
  };

  if (typeof options.revalidate === "number") {
    requestOptions.next = { revalidate: options.revalidate };
  } else {
    requestOptions.cache = "no-store";
  }

  const response = await fetch(`${getBaseUrl()}${endpoint}`, requestOptions);

  if (!response.ok) {
    const bodyText = await response.text();
    const message = `Directus request failed: ${response.status} ${endpoint}${bodyText ? ` - ${bodyText}` : ""}`;
    const error = new Error(message) as ApiRequestError;
    error.status = response.status;
    error.endpoint = endpoint;
    error.responseBody = bodyText;
    throw error;
  }

  return (await response.json()) as T;
}

function withLocale(locale?: AppLocale): string {
  return locale ? `?locale=${locale}` : "";
}

function toCountryQueryString(
  filters?: CountryFilters,
): string {
  const params = new URLSearchParams();
  params.set("filter[is_state][_eq]", "false");
  params.set("filter[enabled][_eq]", "true");
  if (filters?.minHiking) {
    params.set("filter[hiking_level][_gte]", String(filters.minHiking));
  }
  if (filters?.minBeach) {
    params.set("filter[beach_level][_gte]", String(filters.minBeach));
  }
  if (filters?.minRoadtrip) {
    params.set("filter[roadtrip_level][_gte]", String(filters.minRoadtrip));
  }
  if (typeof filters?.pregnancySafe === "boolean") {
    params.set("filter[pregnancy_safe][_eq]", String(filters.pregnancySafe));
  }
  if (typeof filters?.infantSafe === "boolean") {
    params.set("filter[infant_safe][_eq]", String(filters.infantSafe));
  }
  if (filters?.maxFlight) {
    params.set("filter[avg_cheap_flight_price][_lte]", String(filters.maxFlight));
  }
  if (filters?.maxAccommodation) {
    params.set("filter[avg_accommodation_price][_lte]", String(filters.maxAccommodation));
  }
  if (filters?.maxFoodPerDay) {
    params.set("filter[avg_food_price_per_day][_lte]", String(filters.maxFoodPerDay));
  }
  if (filters?.maxBudget) {
    params.set("filter[avg_cheap_flight_price][_lte]", String(filters.maxBudget));
    params.set("filter[avg_accommodation_price][_lte]", String(filters.maxBudget));
  }
  params.set("limit", "-1");

  const encoded = params.toString();
  return encoded.length > 0 ? `?${encoded}` : "";
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return undefined;
}

function pick(item: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in item && typeof item[key] !== "undefined") {
      return item[key];
    }
  }
  return undefined;
}

function localizedText(item: UnknownRecord, locale: AppLocale, field: string): string | undefined {
  const base = asString(item[field]);
  if (base) return base;

  const preferred = asString(item[`${field}_${locale}`]);
  if (preferred) return preferred;

  const fallback = locale === "cs" ? asString(item[`${field}_en`]) : asString(item[`${field}_cs`]);
  return fallback;
}

function toAssetUrl(value: unknown): string | undefined {
  if (isRecord(value)) {
    const directUrl = asString(pick(value, ["url"]));
    if (directUrl) {
      return /^https?:\/\//i.test(directUrl) ? directUrl : `${getBaseUrl()}${directUrl}`;
    }
    const fileId = asString(pick(value, ["id"]));
    if (fileId) {
      return `${getBaseUrl()}/assets/${encodeURIComponent(fileId)}`;
    }
  }

  const raw = asString(value);
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${getBaseUrl()}${raw}`;
  return `${getBaseUrl()}/assets/${encodeURIComponent(raw)}`;
}

function mapHeroImage(item: UnknownRecord): MediaAsset | null {
  const url =
    asString(pick(item, ["hero_image_url", "heroImageUrl"])) ??
    toAssetUrl(pick(item, ["hero_image", "heroImage"]));
  if (!url) return null;
  return {
    url,
    alternativeText: asString(pick(item, ["hero_image_alt", "heroImageAlt"])) ?? null,
  };
}

function mapWonder(item: UnknownRecord, locale: AppLocale): WonderSummary | null {
  const id = pick(item, ["id"]);
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }

  const name = localizedText(item, locale, "name");
  const slug = asString(pick(item, ["slug"]));
  if (!name || !slug) {
    return null;
  }

  return {
    id,
    name,
    slug,
    shortDescription: localizedText(item, locale, "short_description") ?? null,
    heroImage: mapHeroImage(item),
    locationLat: asNumber(pick(item, ["location_lat", "locationLat"])),
    locationLng: asNumber(pick(item, ["location_lng", "locationLng"])),
    hikingDifficulty: asNumber(pick(item, ["hiking_difficulty", "hikingDifficulty"])),
    altitudeMeters: asNumber(pick(item, ["altitude_meters", "altitudeMeters"])),
    pregnancySafe: asBoolean(pick(item, ["pregnancy_safe", "pregnancySafe"])),
    infantSafe: asBoolean(pick(item, ["infant_safe", "infantSafe"])),
  };
}

function mapWonders(value: unknown, locale: AppLocale): WonderSummary[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const wonders: WonderSummary[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const mapped = mapWonder(entry, locale);
    if (mapped) wonders.push(mapped);
  }
  return wonders;
}

function mapCountry(item: UnknownRecord, locale: AppLocale): CountrySummary | null {
  const id = pick(item, ["id"]);
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }

  const slug = asString(pick(item, ["slug"]));
  const name = localizedText(item, locale, "name");
  if (!slug || !name) {
    return null;
  }

  return {
    id,
    name,
    slug,
    isoCode: asString(pick(item, ["iso_code", "isoCode"])),
    isState: asBoolean(pick(item, ["is_state", "isState"])) ?? false,
    enabled: asBoolean(pick(item, ["enabled"])) ?? true,
    description: localizedText(item, locale, "description") ?? null,
    hikingLevel: asNumber(pick(item, ["hiking_level", "hikingLevel"])),
    beachLevel: asNumber(pick(item, ["beach_level", "beachLevel"])),
    roadtripLevel: asNumber(pick(item, ["roadtrip_level", "roadtripLevel"])),
    minDays: asNumber(pick(item, ["min_days", "minDays"])),
    optimalDays: asNumber(pick(item, ["optimal_days", "optimalDays"])),
    avgAccommodationPrice: asNumber(
      pick(item, ["avg_accommodation_price", "avgAccommodationPrice"]),
    ),
    avgFoodPricePerDay: asNumber(pick(item, ["avg_food_price_per_day", "avgFoodPricePerDay"])),
    pregnancySafe: asBoolean(pick(item, ["pregnancy_safe", "pregnancySafe"])),
    infantSafe: asBoolean(pick(item, ["infant_safe", "infantSafe"])),
    heroImage: mapHeroImage(item),
    wonders: mapWonders(pick(item, ["wonders"]), locale),
  };
}

function mapCountriesFromEnvelope(
  payload: ApiEnvelope<unknown>,
  locale: AppLocale,
): CountrySummary[] {
  if (!Array.isArray(payload.data)) return [];
  const countries: CountrySummary[] = [];
  for (const item of payload.data) {
    if (!isRecord(item)) continue;
    const mapped = mapCountry(item, locale);
    if (mapped) countries.push(mapped);
  }
  return countries.sort((left, right) => left.name.localeCompare(right.name));
}

function toRequestLocale(locale?: AppLocale): AppLocale {
  return locale === "cs" ? "cs" : "en";
}

function toCountriesEndpoint(filters?: CountryFilters): string {
  const query = toCountryQueryString(filters);
  return `/items/countries${query}`;
}

export function stripRichText(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function formatCurrency(
  value: number | undefined,
  currency = "USD",
  locale: AppLocale = "en",
): string {
  if (value === undefined) return "N/A";

  const intlLocale = locale === "cs" ? "cs-CZ" : "en-US";

  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export async function fetchCountries(
  filters?: CountryFilters,
  locale?: AppLocale,
): Promise<CountrySummary[]> {
  const requestLocale = toRequestLocale(locale);
  const endpoint = toCountriesEndpoint(filters);
  const payload = await apiFetch<ApiEnvelope<unknown>>(endpoint);
  return mapCountriesFromEnvelope(payload, requestLocale);
}

export async function fetchCountryBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<Country | null> {
  const payload = await apiFetch<ApiEnvelope<Country>>(
    `/api/countries/${encodeURIComponent(slug)}${withLocale(locale)}`,
  );
  return payload.data ?? null;
}

export async function fetchWonderBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<Wonder | null> {
  const payload = await apiFetch<ApiEnvelope<Wonder>>(
    `/api/wonders/${encodeURIComponent(slug)}${withLocale(locale)}`,
  );
  return payload.data ?? null;
}

export async function fetchSpecialists(params?: {
  type?: "local_advisor" | "community_leader";
  locale?: AppLocale;
}): Promise<SpecialistSummary[]> {
  const search = new URLSearchParams();
  if (params?.locale) search.set("locale", params.locale);
  if (params?.type) search.set("type", params.type);
  const query = search.toString();
  const payload = await apiFetch<ApiEnvelope<SpecialistSummary[]>>(
    `/api/specialists${query ? `?${query}` : ""}`,
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchSpecialistBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<Specialist | null> {
  const payload = await apiFetch<ApiEnvelope<Specialist>>(
    `/api/specialists/${encodeURIComponent(slug)}${withLocale(locale)}`,
  );
  return payload.data ?? null;
}

export async function fetchCountryCombinationBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<CountryCombination | null> {
  const payload = await apiFetch<ApiEnvelope<CountryCombination>>(
    `/api/country-combinations/${encodeURIComponent(slug)}${withLocale(locale)}`,
  );
  return payload.data ?? null;
}
