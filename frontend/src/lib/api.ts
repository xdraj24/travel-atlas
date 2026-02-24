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

interface FetchCountriesOptions {
  includeStates?: boolean;
  includeDisabled?: boolean;
}

export interface MediaAsset {
  id?: EntityId;
  url: string;
  alternativeText?: string | null;
}

export interface CountrySummary {
  id: EntityId;
  name: string;
  nameEn?: string;
  nameCs?: string;
  slug: string;
  isoCode?: string;
  isState?: boolean;
  enabled?: boolean;
  parentCountryId?: EntityId | null;
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
  options?: FetchCountriesOptions,
): string {
  const params = new URLSearchParams();
  if (!options?.includeStates) {
    params.set("filter[is_state][_eq]", "false");
  }
  if (!options?.includeDisabled) {
    params.set("filter[enabled][_eq]", "true");
  }
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

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const values = value
      .map((entry) => asString(entry))
      .filter((entry): entry is string => typeof entry === "string");
    return values.length > 0 ? values : undefined;
  }

  const text = asString(value);
  if (!text) return undefined;
  const values = text
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return values.length > 0 ? values : undefined;
}

function asEntityId(value: unknown): EntityId | undefined {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (isRecord(value)) {
    const nested = pick(value, ["id"]);
    if (typeof nested === "number" || typeof nested === "string") {
      return nested;
    }
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

function mapProfileImage(item: UnknownRecord): MediaAsset | null {
  const url =
    asString(pick(item, ["profile_image_url", "profileImageUrl"])) ??
    toAssetUrl(pick(item, ["profile_image", "profileImage"]));
  if (!url) return null;
  return {
    url,
    alternativeText: asString(pick(item, ["profile_image_alt", "profileImageAlt"])) ?? null,
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
    nameEn: asString(pick(item, ["name_en", "nameEn"])) ?? (locale === "en" ? name : undefined),
    nameCs: asString(pick(item, ["name_cs", "nameCs"])) ?? (locale === "cs" ? name : undefined),
    slug,
    isoCode: asString(pick(item, ["iso_code", "isoCode"])),
    isState: asBoolean(pick(item, ["is_state", "isState"])) ?? false,
    enabled: asBoolean(pick(item, ["enabled"])) ?? true,
    parentCountryId: asEntityId(pick(item, ["parent_country_id", "parentCountryId"])) ?? null,
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

function mapHike(item: UnknownRecord, locale: AppLocale): HikeSummary | null {
  const id = pick(item, ["id"]);
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }

  const name = localizedText(item, locale, "name");
  if (!name) return null;

  return {
    id,
    name,
    difficulty: asNumber(pick(item, ["difficulty"])),
    elevationGain: asNumber(pick(item, ["elevation_gain", "elevationGain"])),
    distanceKm: asNumber(pick(item, ["distance_km", "distanceKm"])),
    durationHours: asNumber(pick(item, ["duration_hours", "durationHours"])),
    bestSeason: localizedText(item, locale, "best_season"),
    description: localizedText(item, locale, "description") ?? null,
  };
}

function mapAttraction(item: UnknownRecord, locale: AppLocale): AttractionSummary | null {
  const id = pick(item, ["id"]);
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }

  const name = localizedText(item, locale, "name");
  if (!name) return null;

  const rawType = asString(pick(item, ["type"]));
  const type =
    rawType === "beach" || rawType === "viewpoint" || rawType === "town" || rawType === "waterfall"
      ? rawType
      : undefined;

  return {
    id,
    name,
    type,
    description: localizedText(item, locale, "description") ?? null,
  };
}

function mapSpecialist(item: UnknownRecord, locale: AppLocale): SpecialistSummary | null {
  const id = pick(item, ["id"]);
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }

  const name = localizedText(item, locale, "name");
  const slug = asString(pick(item, ["slug"]));
  const rawType = asString(pick(item, ["type"]));
  if (!name || !slug || (rawType !== "local_advisor" && rawType !== "community_leader")) {
    return null;
  }

  return {
    id,
    name,
    slug,
    type: rawType,
    rating: asNumber(pick(item, ["rating"])),
    languages:
      asStringArray(
        pick(item, [
          locale === "cs" ? "languages_cs" : "languages_en",
          locale === "cs" ? "languagesCs" : "languagesEn",
        ]),
      ) ?? [],
    offersChat: asBoolean(pick(item, ["offers_chat", "offersChat"])),
    offersTrips: asBoolean(pick(item, ["offers_trips", "offersTrips"])),
    tripPriceFrom: asNumber(pick(item, ["trip_price_from", "tripPriceFrom"])),
    whatsappLink: asString(pick(item, ["whatsapp_link", "whatsappLink"])) ?? null,
    instagramLink: asString(pick(item, ["instagram_link", "instagramLink"])) ?? null,
    profileImage: mapProfileImage(item),
  };
}

function mapTrip(
  item: UnknownRecord,
  locale: AppLocale,
  startDates: string[] = [],
): TripSummary | null {
  const id = pick(item, ["id"]);
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }

  const title = localizedText(item, locale, "title");
  const slug = asString(pick(item, ["slug"]));
  if (!title || !slug) {
    return null;
  }

  return {
    id,
    title,
    slug,
    durationDays: asNumber(pick(item, ["duration_days", "durationDays"])),
    price: asNumber(pick(item, ["price"])),
    difficulty: asNumber(pick(item, ["difficulty"])),
    maxGroupSize: asNumber(pick(item, ["max_group_size", "maxGroupSize"])),
    description: localizedText(item, locale, "description") ?? null,
    startDates: [...startDates].sort((left, right) => left.localeCompare(right)),
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

function localizedSortColumn(locale: AppLocale, field: string): string {
  return locale === "cs" ? `${field}_cs` : `${field}_en`;
}

function withQuery(endpoint: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query.length > 0 ? `${endpoint}?${query}` : endpoint;
}

async function fetchItems(collection: string, searchParams: URLSearchParams): Promise<UnknownRecord[]> {
  const payload = await apiFetch<ApiEnvelope<unknown>>(withQuery(`/items/${collection}`, searchParams));
  if (!Array.isArray(payload.data)) return [];

  const rows: UnknownRecord[] = [];
  for (const item of payload.data) {
    if (isRecord(item)) rows.push(item);
  }
  return rows;
}

function rankById(orderedIds: EntityId[]): Map<string, number> {
  const rank = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    const key = String(id);
    if (!rank.has(key)) {
      rank.set(key, index);
    }
  });
  return rank;
}

async function fetchCountryBySlugFromItems(
  slug: string,
  locale: AppLocale,
): Promise<Country | null> {
  const countryParams = new URLSearchParams();
  countryParams.set("filter[slug][_eq]", slug);
  countryParams.set("filter[enabled][_eq]", "true");
  countryParams.set("limit", "1");

  const [countryRow] = await fetchItems("countries", countryParams);
  if (!countryRow) return null;

  const mappedCountry = mapCountry(countryRow, locale);
  const countryId = asEntityId(pick(countryRow, ["id"]));
  if (!mappedCountry || typeof countryId === "undefined") return null;

  const parentCountryId = asEntityId(pick(countryRow, ["parent_country_id", "parentCountryId"]));

  const parentCountryPromise = (() => {
    if (typeof parentCountryId === "undefined") {
      return Promise.resolve<UnknownRecord[]>([]);
    }
    const params = new URLSearchParams();
    params.set("filter[id][_eq]", String(parentCountryId));
    params.set("filter[enabled][_eq]", "true");
    params.set("limit", "1");
    return fetchItems("countries", params);
  })();

  const regionsParams = new URLSearchParams();
  regionsParams.set("filter[parent_country_id][_eq]", String(countryId));
  regionsParams.set("filter[enabled][_eq]", "true");
  regionsParams.set("sort", localizedSortColumn(locale, "name"));
  regionsParams.set("limit", "-1");

  const wondersParams = new URLSearchParams();
  wondersParams.set("filter[country_id][_eq]", String(countryId));
  wondersParams.set("sort", localizedSortColumn(locale, "name"));
  wondersParams.set("limit", "-1");

  const hikesParams = new URLSearchParams();
  hikesParams.set("filter[country_id][_eq]", String(countryId));
  hikesParams.set("sort", localizedSortColumn(locale, "name"));
  hikesParams.set("limit", "-1");

  const attractionsParams = new URLSearchParams();
  attractionsParams.set("filter[country_id][_eq]", String(countryId));
  attractionsParams.set("sort", localizedSortColumn(locale, "name"));
  attractionsParams.set("limit", "-1");

  const featuredCountriesParams = new URLSearchParams();
  featuredCountriesParams.set("filter[country_id][_eq]", String(countryId));
  featuredCountriesParams.set("sort", "sort_order");
  featuredCountriesParams.set("limit", "-1");

  const bestCombinationsParams = new URLSearchParams();
  bestCombinationsParams.set("filter[country_id][_eq]", String(countryId));
  bestCombinationsParams.set("sort", "sort_order");
  bestCombinationsParams.set("limit", "-1");

  const [
    parentCountryRows,
    regionRows,
    wonderRows,
    hikeRows,
    attractionRows,
    featuredCountryRows,
    bestCombinationRows,
  ] = await Promise.all([
    parentCountryPromise,
    fetchItems("countries", regionsParams),
    fetchItems("wonders", wondersParams),
    fetchItems("hikes", hikesParams),
    fetchItems("attractions", attractionsParams),
    fetchItems("specialist_featured_countries", featuredCountriesParams),
    fetchItems("country_best_combinations", bestCombinationsParams),
  ]);

  const specialistIds: EntityId[] = [];
  for (const row of featuredCountryRows) {
    const specialistId = asEntityId(pick(row, ["specialist_id", "specialistId"]));
    if (typeof specialistId !== "undefined") {
      specialistIds.push(specialistId);
    }
  }

  const relatedCountryIds: EntityId[] = [];
  for (const row of bestCombinationRows) {
    const relatedCountryId = asEntityId(pick(row, ["related_country_id", "relatedCountryId"]));
    if (typeof relatedCountryId !== "undefined") {
      relatedCountryIds.push(relatedCountryId);
    }
  }

  const specialistsPromise = (() => {
    if (specialistIds.length === 0) {
      return Promise.resolve<UnknownRecord[]>([]);
    }
    const params = new URLSearchParams();
    params.set("filter[id][_in]", specialistIds.map((id) => String(id)).join(","));
    params.set("filter[enabled][_eq]", "true");
    params.set("limit", "-1");
    return fetchItems("specialists", params);
  })();

  const relatedCountriesPromise = (() => {
    if (relatedCountryIds.length === 0) {
      return Promise.resolve<UnknownRecord[]>([]);
    }
    const params = new URLSearchParams();
    params.set("filter[id][_in]", relatedCountryIds.map((id) => String(id)).join(","));
    params.set("filter[enabled][_eq]", "true");
    params.set("limit", "-1");
    return fetchItems("countries", params);
  })();

  const [specialistRows, relatedCountryRows] = await Promise.all([
    specialistsPromise,
    relatedCountriesPromise,
  ]);

  const parentCountry = parentCountryRows.length > 0 ? mapCountry(parentCountryRows[0], locale) : null;

  const regions: CountrySummary[] = [];
  for (const row of regionRows) {
    const mapped = mapCountry(row, locale);
    if (mapped) regions.push(mapped);
  }

  const wonders: WonderSummary[] = [];
  for (const row of wonderRows) {
    const mapped = mapWonder(row, locale);
    if (mapped) wonders.push(mapped);
  }

  const hikes: HikeSummary[] = [];
  for (const row of hikeRows) {
    const mapped = mapHike(row, locale);
    if (mapped) hikes.push(mapped);
  }

  const attractions: AttractionSummary[] = [];
  for (const row of attractionRows) {
    const mapped = mapAttraction(row, locale);
    if (mapped) attractions.push(mapped);
  }

  const specialistRank = rankById(specialistIds);
  const specialists: SpecialistSummary[] = [];
  for (const row of specialistRows) {
    const mapped = mapSpecialist(row, locale);
    if (mapped) specialists.push(mapped);
  }
  specialists.sort((left, right) => {
    const leftRank = specialistRank.get(String(left.id)) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = specialistRank.get(String(right.id)) ?? Number.MAX_SAFE_INTEGER;
    if (leftRank !== rightRank) return leftRank - rightRank;

    const leftRating = left.rating ?? Number.NEGATIVE_INFINITY;
    const rightRating = right.rating ?? Number.NEGATIVE_INFINITY;
    if (leftRating !== rightRating) return rightRating - leftRating;

    return left.name.localeCompare(right.name);
  });

  const relatedCountryRank = rankById(relatedCountryIds);
  const bestCombinedWith: CountrySummary[] = [];
  for (const row of relatedCountryRows) {
    const mapped = mapCountry(row, locale);
    if (mapped) bestCombinedWith.push(mapped);
  }
  bestCombinedWith.sort((left, right) => {
    const leftRank = relatedCountryRank.get(String(left.id)) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = relatedCountryRank.get(String(right.id)) ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });

  return {
    ...mappedCountry,
    avgDirectFlightPrice: asNumber(
      pick(countryRow, ["avg_direct_flight_price", "avgDirectFlightPrice"]),
    ),
    avgCheapFlightPrice: asNumber(
      pick(countryRow, ["avg_cheap_flight_price", "avgCheapFlightPrice"]),
    ),
    geoJson: pick(countryRow, ["geo_json", "geoJson"]),
    parentCountry,
    regions,
    bestCombinedWith,
    wonders,
    hikes,
    attractions,
    specialists,
  };
}

async function fetchWonderBySlugFromItems(
  slug: string,
  locale: AppLocale,
): Promise<Wonder | null> {
  const wonderParams = new URLSearchParams();
  wonderParams.set("filter[slug][_eq]", slug);
  wonderParams.set("limit", "1");

  const [wonderRow] = await fetchItems("wonders", wonderParams);
  if (!wonderRow) return null;

  const mappedWonder = mapWonder(wonderRow, locale);
  const wonderId = asEntityId(pick(wonderRow, ["id"]));
  if (!mappedWonder || typeof wonderId === "undefined") return null;

  const countryId = asEntityId(pick(wonderRow, ["country_id", "countryId"]));

  const countryPromise = (() => {
    if (typeof countryId === "undefined") {
      return Promise.resolve<UnknownRecord[]>([]);
    }
    const params = new URLSearchParams();
    params.set("filter[id][_eq]", String(countryId));
    params.set("filter[enabled][_eq]", "true");
    params.set("limit", "1");
    return fetchItems("countries", params);
  })();

  const hikesParams = new URLSearchParams();
  hikesParams.set("filter[wonder_id][_eq]", String(wonderId));
  hikesParams.set("sort", localizedSortColumn(locale, "name"));
  hikesParams.set("limit", "-1");

  const tagsParams = new URLSearchParams();
  tagsParams.set("filter[wonder_id][_eq]", String(wonderId));
  tagsParams.set("sort", "sort_order");
  tagsParams.set("limit", "-1");

  const [countryRows, hikeRows, tagRows] = await Promise.all([
    countryPromise,
    fetchItems("hikes", hikesParams),
    fetchItems("wonder_tags", tagsParams),
  ]);

  const country: CountrySummary[] = [];
  for (const row of countryRows) {
    const mapped = mapCountry(row, locale);
    if (mapped) country.push(mapped);
  }

  const hikes: HikeSummary[] = [];
  for (const row of hikeRows) {
    const mapped = mapHike(row, locale);
    if (mapped) hikes.push(mapped);
  }

  const tags: string[] = [];
  for (const row of tagRows) {
    const label = localizedText(row, locale, "label");
    if (label) tags.push(label);
  }

  return {
    ...mappedWonder,
    fullDescription: localizedText(wonderRow, locale, "full_description") ?? null,
    tags,
    country,
    hikes,
  };
}

async function fetchSpecialistsFromItems(params?: {
  type?: "local_advisor" | "community_leader";
  locale?: AppLocale;
}): Promise<SpecialistSummary[]> {
  const locale = toRequestLocale(params?.locale);
  const specialistsParams = new URLSearchParams();
  specialistsParams.set("filter[enabled][_eq]", "true");
  specialistsParams.set("limit", "-1");
  if (params?.type) {
    specialistsParams.set("filter[type][_eq]", params.type);
  }

  const specialistRows = await fetchItems("specialists", specialistsParams);

  const specialists: SpecialistSummary[] = [];
  for (const row of specialistRows) {
    const mapped = mapSpecialist(row, locale);
    if (mapped) specialists.push(mapped);
  }

  specialists.sort((left, right) => {
    const leftRating = left.rating ?? Number.NEGATIVE_INFINITY;
    const rightRating = right.rating ?? Number.NEGATIVE_INFINITY;
    if (leftRating !== rightRating) return rightRating - leftRating;
    return left.name.localeCompare(right.name);
  });

  return specialists;
}

async function fetchSpecialistBySlugFromItems(
  slug: string,
  locale: AppLocale,
): Promise<Specialist | null> {
  const specialistParams = new URLSearchParams();
  specialistParams.set("filter[slug][_eq]", slug);
  specialistParams.set("filter[enabled][_eq]", "true");
  specialistParams.set("limit", "1");

  const [specialistRow] = await fetchItems("specialists", specialistParams);
  if (!specialistRow) return null;

  const mappedSpecialist = mapSpecialist(specialistRow, locale);
  const specialistId = asEntityId(pick(specialistRow, ["id"]));
  if (!mappedSpecialist || typeof specialistId === "undefined") return null;

  const countryId = asEntityId(pick(specialistRow, ["country_id", "countryId"]));
  const countryPromise = (() => {
    if (typeof countryId === "undefined") {
      return Promise.resolve<UnknownRecord[]>([]);
    }
    const params = new URLSearchParams();
    params.set("filter[id][_eq]", String(countryId));
    params.set("filter[enabled][_eq]", "true");
    params.set("limit", "1");
    return fetchItems("countries", params);
  })();

  const tripsParams = new URLSearchParams();
  tripsParams.set("filter[specialist_id][_eq]", String(specialistId));
  tripsParams.set("sort", localizedSortColumn(locale, "title"));
  tripsParams.set("limit", "-1");

  const tripRows = await fetchItems("trips", tripsParams);
  const tripIds: EntityId[] = [];
  for (const row of tripRows) {
    const tripId = asEntityId(pick(row, ["id"]));
    if (typeof tripId !== "undefined") tripIds.push(tripId);
  }

  const startDatesPromise = (() => {
    if (tripIds.length === 0) {
      return Promise.resolve<UnknownRecord[]>([]);
    }
    const params = new URLSearchParams();
    params.set("filter[trip_id][_in]", tripIds.map((id) => String(id)).join(","));
    params.set("sort", "start_date");
    params.set("limit", "-1");
    return fetchItems("trip_start_dates", params);
  })();

  const [countryRows, startDateRows] = await Promise.all([countryPromise, startDatesPromise]);
  const country = countryRows.length > 0 ? mapCountry(countryRows[0], locale) : null;

  const startDatesByTrip = new Map<string, string[]>();
  for (const row of startDateRows) {
    const tripId = asEntityId(pick(row, ["trip_id", "tripId"]));
    const startDate = asString(pick(row, ["start_date", "startDate"]));
    if (typeof tripId === "undefined" || !startDate) continue;

    const key = String(tripId);
    const current = startDatesByTrip.get(key);
    if (current) {
      current.push(startDate);
    } else {
      startDatesByTrip.set(key, [startDate]);
    }
  }

  const trips: TripSummary[] = [];
  for (const row of tripRows) {
    const tripId = asEntityId(pick(row, ["id"]));
    const mapped = mapTrip(
      row,
      locale,
      typeof tripId === "undefined" ? [] : (startDatesByTrip.get(String(tripId)) ?? []),
    );
    if (mapped) trips.push(mapped);
  }

  return {
    ...mappedSpecialist,
    bio: localizedText(specialistRow, locale, "bio") ?? null,
    country,
    trips,
  };
}

function toCountriesEndpoint(
  filters?: CountryFilters,
  options?: FetchCountriesOptions,
): string {
  const query = toCountryQueryString(filters, options);
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
  options?: FetchCountriesOptions,
): Promise<CountrySummary[]> {
  const requestLocale = toRequestLocale(locale);
  const endpoint = toCountriesEndpoint(filters, options);
  const payload = await apiFetch<ApiEnvelope<unknown>>(endpoint);
  return mapCountriesFromEnvelope(payload, requestLocale);
}

export async function fetchCountryBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<Country | null> {
  const requestLocale = toRequestLocale(locale);
  try {
    const payload = await apiFetch<ApiEnvelope<Country>>(
      `/api/countries/${encodeURIComponent(slug)}${withLocale(locale)}`,
    );
    return payload.data ?? null;
  } catch (error) {
    const apiError = error as ApiRequestError;
    if (apiError.status === 404) {
      return fetchCountryBySlugFromItems(slug, requestLocale);
    }
    throw error;
  }
}

export async function fetchWonderBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<Wonder | null> {
  const requestLocale = toRequestLocale(locale);
  try {
    const payload = await apiFetch<ApiEnvelope<Wonder>>(
      `/api/wonders/${encodeURIComponent(slug)}${withLocale(locale)}`,
    );
    return payload.data ?? null;
  } catch (error) {
    const apiError = error as ApiRequestError;
    if (apiError.status === 404) {
      return fetchWonderBySlugFromItems(slug, requestLocale);
    }
    throw error;
  }
}

export async function fetchSpecialists(params?: {
  type?: "local_advisor" | "community_leader";
  locale?: AppLocale;
}): Promise<SpecialistSummary[]> {
  const requestLocale = toRequestLocale(params?.locale);
  const search = new URLSearchParams();
  if (params?.locale) search.set("locale", params.locale);
  if (params?.type) search.set("type", params.type);
  const query = search.toString();
  try {
    const payload = await apiFetch<ApiEnvelope<SpecialistSummary[]>>(
      `/api/specialists${query ? `?${query}` : ""}`,
    );
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    const apiError = error as ApiRequestError;
    if (apiError.status === 404) {
      return fetchSpecialistsFromItems({
        type: params?.type,
        locale: requestLocale,
      });
    }
    throw error;
  }
}

export async function fetchSpecialistBySlug(
  slug: string,
  locale?: AppLocale,
): Promise<Specialist | null> {
  const requestLocale = toRequestLocale(locale);
  try {
    const payload = await apiFetch<ApiEnvelope<Specialist>>(
      `/api/specialists/${encodeURIComponent(slug)}${withLocale(locale)}`,
    );
    return payload.data ?? null;
  } catch (error) {
    const apiError = error as ApiRequestError;
    if (apiError.status === 404) {
      return fetchSpecialistBySlugFromItems(slug, requestLocale);
    }
    throw error;
  }
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
