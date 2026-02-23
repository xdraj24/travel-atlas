import { type CountryFilters } from "@/lib/filters";
import { type AppLocale } from "@/lib/locale";

type EntityId = number | string;

interface ApiEnvelope<T> {
  data?: T;
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
  homepageCountries: "/api/countries?locale=cs",
  filteredCountries: "/api/countries?locale=en&minHiking=3&pregnancySafe=true&maxFlight=500",
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
  return process.env.DIRECTUS_TOKEN ?? process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
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
    throw new Error(`Directus request failed: ${response.status} ${endpoint}`);
  }

  return (await response.json()) as T;
}

function withLocale(locale?: AppLocale): string {
  return locale ? `?locale=${locale}` : "";
}

function toCountryQueryString(filters?: CountryFilters, locale?: AppLocale): string {
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  if (filters?.minHiking) params.set("minHiking", String(filters.minHiking));
  if (filters?.minBeach) params.set("minBeach", String(filters.minBeach));
  if (filters?.minRoadtrip) params.set("minRoadtrip", String(filters.minRoadtrip));
  if (typeof filters?.pregnancySafe === "boolean") {
    params.set("pregnancySafe", String(filters.pregnancySafe));
  }
  if (typeof filters?.infantSafe === "boolean") {
    params.set("infantSafe", String(filters.infantSafe));
  }
  if (filters?.maxFlight) params.set("maxFlight", String(filters.maxFlight));
  if (filters?.maxAccommodation) {
    params.set("maxAccommodation", String(filters.maxAccommodation));
  }
  if (filters?.maxFoodPerDay) {
    params.set("maxFoodPerDay", String(filters.maxFoodPerDay));
  }
  if (filters?.maxBudget) params.set("maxBudget", String(filters.maxBudget));
  const encoded = params.toString();
  return encoded.length > 0 ? `?${encoded}` : "";
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
  const query = toCountryQueryString(filters, locale);
  const payload = await apiFetch<ApiEnvelope<CountrySummary[]>>(`/api/countries${query}`);
  return Array.isArray(payload.data) ? payload.data : [];
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
