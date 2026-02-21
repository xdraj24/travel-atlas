import { buildCountryStrapiFilters, type CountryFilters } from "@/lib/filters";

type EntityId = number | string;

interface StrapiEnvelope {
  data?: unknown;
}

interface StrapiFetchOptions {
  revalidate?: number;
}

export interface MediaAsset {
  id?: EntityId;
  url: string;
  alternativeText?: string | null;
}

export interface CountrySummary {
  id: EntityId;
  documentId?: string;
  name: string;
  slug: string;
  isoCode?: string;
  isState?: boolean;
  description?: string | null;
  hikingLevel?: number;
  beachLevel?: number;
  roadtripLevel?: number;
  minDays?: number;
  optimalDays?: number;
  heroImage?: MediaAsset | null;
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
  documentId?: string;
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
  documentId?: string;
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
  hikingLevel?: number;
  beachLevel?: number;
  roadtripLevel?: number;
  minDays?: number;
  optimalDays?: number;
  avgDirectFlightPrice?: number;
  avgCheapFlightPrice?: number;
  avgAccommodationPrice?: number;
  avgFoodPricePerDay?: number;
  pregnancySafe?: boolean;
  infantSafe?: boolean;
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
  documentId?: string;
  name: string;
  slug: string;
  description?: string | null;
  minDays?: number;
  optimalDays?: number;
  routeDescription?: string | null;
  countries?: CountrySummary[];
}

export const EXAMPLE_FETCH_QUERIES = {
  homepageCountries:
    "/api/countries?filters[isState][$eq]=false&populate[heroImage]=true&sort[0]=name:asc",
  filteredCountries:
    "/api/countries?filters[hikingLevel][$gte]=3&filters[pregnancySafe][$eq]=true&filters[avgCheapFlightPrice][$lte]=500",
  countryBySlug:
    "/api/countries?filters[slug][$eq]=italy&populate[wonders][populate][heroImage]=true&populate[specialists][populate][profileImage]=true",
  wonderBySlug:
    "/api/wonders?filters[slug][$eq]=tre-cime&populate[country]=true&populate[hikes]=true",
} as const;

function toStringValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function toNumberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
}

function toEntityId(value: unknown): EntityId | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) return value;
  return undefined;
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function getBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_STRAPI_URL ?? process.env.STRAPI_URL;
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_STRAPI_URL");
  }
  return normalizeUrl(value);
}

function getToken(): string | undefined {
  return process.env.STRAPI_API_TOKEN ?? process.env.NEXT_PUBLIC_STRAPI_KEY;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeEntity(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;

  if (isRecord(value.attributes)) {
    return {
      ...value.attributes,
      id: value.id ?? value.attributes.id,
      documentId: value.documentId ?? value.attributes.documentId,
    };
  }

  return value;
}

function normalizeRelation(value: unknown): unknown {
  if (!value) return null;
  if (isRecord(value) && "data" in value) {
    return normalizeRelation((value as StrapiEnvelope).data);
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeEntity(entry))
      .filter((entry): entry is Record<string, unknown> => entry !== null);
  }
  return normalizeEntity(value);
}

function parseMedia(value: unknown): MediaAsset | null {
  const relation = normalizeRelation(value);
  const mediaObject = Array.isArray(relation) ? relation[0] : relation;
  if (!isRecord(mediaObject)) return null;

  const rawUrl = toStringValue(mediaObject.url);
  if (!rawUrl) return null;

  const absoluteUrl = rawUrl.startsWith("http")
    ? rawUrl
    : `${getBaseUrl()}${rawUrl}`;

  return {
    id: (mediaObject.id as EntityId | undefined) ?? undefined,
    url: absoluteUrl,
    alternativeText: toStringValue(mediaObject.alternativeText) ?? null,
  };
}

function parseStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .map((item) => toStringValue(item))
      .filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

function parseCountrySummary(value: unknown): CountrySummary | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;

  const id = toEntityId(entity.id) ?? toEntityId(entity.documentId);
  const name = toStringValue(entity.name);
  const slug = toStringValue(entity.slug);
  if (!id || !name || !slug) return null;

  return {
    id,
    documentId: toStringValue(entity.documentId),
    name,
    slug,
    isoCode: toStringValue(entity.isoCode),
    isState: toBooleanValue(entity.isState),
    description: toStringValue(entity.description) ?? null,
    hikingLevel: toNumberValue(entity.hikingLevel),
    beachLevel: toNumberValue(entity.beachLevel),
    roadtripLevel: toNumberValue(entity.roadtripLevel),
    minDays: toNumberValue(entity.minDays),
    optimalDays: toNumberValue(entity.optimalDays),
    heroImage: parseMedia(entity.heroImage),
  };
}

function parseCountrySummaryArray(value: unknown): CountrySummary[] {
  const relation = normalizeRelation(value);
  if (!Array.isArray(relation)) return [];
  return relation
    .map((entry) => parseCountrySummary(entry))
    .filter((entry): entry is CountrySummary => entry !== null);
}

function parseHikeSummary(value: unknown): HikeSummary | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const id = entity.id as EntityId | undefined;
  const name = toStringValue(entity.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    difficulty: toNumberValue(entity.difficulty),
    elevationGain: toNumberValue(entity.elevationGain),
    distanceKm: toNumberValue(entity.distanceKm),
    durationHours: toNumberValue(entity.durationHours),
    bestSeason: toStringValue(entity.bestSeason),
    description: toStringValue(entity.description) ?? null,
  };
}

function parseHikeArray(value: unknown): HikeSummary[] {
  const relation = normalizeRelation(value);
  if (!Array.isArray(relation)) return [];
  return relation
    .map((entry) => parseHikeSummary(entry))
    .filter((entry): entry is HikeSummary => entry !== null);
}

function parseAttractionSummary(value: unknown): AttractionSummary | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const id = entity.id as EntityId | undefined;
  const name = toStringValue(entity.name);
  if (!id || !name) return null;

  const typeValue = toStringValue(entity.type);
  const typedAttraction =
    typeValue === "beach" ||
    typeValue === "viewpoint" ||
    typeValue === "town" ||
    typeValue === "waterfall"
      ? typeValue
      : undefined;

  return {
    id,
    name,
    type: typedAttraction,
    description: toStringValue(entity.description) ?? null,
  };
}

function parseAttractionArray(value: unknown): AttractionSummary[] {
  const relation = normalizeRelation(value);
  if (!Array.isArray(relation)) return [];
  return relation
    .map((entry) => parseAttractionSummary(entry))
    .filter((entry): entry is AttractionSummary => entry !== null);
}

function parseSpecialistSummary(value: unknown): SpecialistSummary | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;

  const id = toEntityId(entity.id) ?? toEntityId(entity.documentId);
  const name = toStringValue(entity.name);
  const slug = toStringValue(entity.slug);
  const type = toStringValue(entity.type);

  if (!id || !name || !slug) return null;
  if (type !== "local_advisor" && type !== "community_leader") return null;

  return {
    id,
    documentId: toStringValue(entity.documentId),
    name,
    slug,
    type,
    rating: toNumberValue(entity.rating),
    languages: parseStringArray(entity.languages),
    offersChat: toBooleanValue(entity.offersChat),
    offersTrips: toBooleanValue(entity.offersTrips),
    tripPriceFrom: toNumberValue(entity.tripPriceFrom),
    whatsappLink: toStringValue(entity.whatsappLink) ?? null,
    instagramLink: toStringValue(entity.instagramLink) ?? null,
    profileImage: parseMedia(entity.profileImage),
  };
}

function parseSpecialistArray(value: unknown): SpecialistSummary[] {
  const relation = normalizeRelation(value);
  if (!Array.isArray(relation)) return [];
  return relation
    .map((entry) => parseSpecialistSummary(entry))
    .filter((entry): entry is SpecialistSummary => entry !== null);
}

function parseWonderSummary(value: unknown): WonderSummary | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;

  const id = toEntityId(entity.id) ?? toEntityId(entity.documentId);
  const name = toStringValue(entity.name);
  const slug = toStringValue(entity.slug);
  if (!id || !name || !slug) return null;

  return {
    id,
    documentId: toStringValue(entity.documentId),
    name,
    slug,
    shortDescription: toStringValue(entity.shortDescription) ?? null,
    heroImage: parseMedia(entity.heroImage),
    locationLat: toNumberValue(entity.locationLat),
    locationLng: toNumberValue(entity.locationLng),
    hikingDifficulty: toNumberValue(entity.hikingDifficulty),
    altitudeMeters: toNumberValue(entity.altitudeMeters),
    pregnancySafe: toBooleanValue(entity.pregnancySafe),
    infantSafe: toBooleanValue(entity.infantSafe),
  };
}

function parseWonderArray(value: unknown): WonderSummary[] {
  const relation = normalizeRelation(value);
  if (!Array.isArray(relation)) return [];
  return relation
    .map((entry) => parseWonderSummary(entry))
    .filter((entry): entry is WonderSummary => entry !== null);
}

function parseTripSummary(value: unknown): TripSummary | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const id = entity.id as EntityId | undefined;
  const title = toStringValue(entity.title);
  const slug = toStringValue(entity.slug);
  if (!id || !title || !slug) return null;

  let startDates: string[] | undefined;
  if (Array.isArray(entity.startDates)) {
    startDates = entity.startDates
      .map((item) => {
        if (!isRecord(item)) return undefined;
        return toStringValue(item.date);
      })
      .filter((item): item is string => typeof item === "string");
  }

  return {
    id,
    title,
    slug,
    durationDays: toNumberValue(entity.durationDays),
    price: toNumberValue(entity.price),
    difficulty: toNumberValue(entity.difficulty),
    maxGroupSize: toNumberValue(entity.maxGroupSize),
    description: toStringValue(entity.description) ?? null,
    startDates,
  };
}

function parseTripArray(value: unknown): TripSummary[] {
  const relation = normalizeRelation(value);
  if (!Array.isArray(relation)) return [];
  return relation
    .map((entry) => parseTripSummary(entry))
    .filter((entry): entry is TripSummary => entry !== null);
}

function parseCountry(value: unknown): Country | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const base = parseCountrySummary(entity);
  if (!base) return null;

  const parentCountryRelation = normalizeRelation(entity.parentCountry);
  const parentCountry = parseCountrySummary(parentCountryRelation);

  return {
    ...base,
    hikingLevel: toNumberValue(entity.hikingLevel),
    beachLevel: toNumberValue(entity.beachLevel),
    roadtripLevel: toNumberValue(entity.roadtripLevel),
    minDays: toNumberValue(entity.minDays),
    optimalDays: toNumberValue(entity.optimalDays),
    avgDirectFlightPrice: toNumberValue(entity.avgDirectFlightPrice),
    avgCheapFlightPrice: toNumberValue(entity.avgCheapFlightPrice),
    avgAccommodationPrice: toNumberValue(entity.avgAccommodationPrice),
    avgFoodPricePerDay: toNumberValue(entity.avgFoodPricePerDay),
    pregnancySafe: toBooleanValue(entity.pregnancySafe),
    infantSafe: toBooleanValue(entity.infantSafe),
    geoJson: entity.geoJson,
    parentCountry,
    regions: parseCountrySummaryArray(entity.regions),
    bestCombinedWith: parseCountrySummaryArray(entity.bestCombinedWith),
    wonders: parseWonderArray(entity.wonders),
    hikes: parseHikeArray(entity.hikes),
    attractions: parseAttractionArray(entity.attractions),
    specialists: parseSpecialistArray(entity.specialists),
  };
}

function parseWonder(value: unknown): Wonder | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const base = parseWonderSummary(entity);
  if (!base) return null;

  let tags: string[] = [];
  if (Array.isArray(entity.tags)) {
    tags = entity.tags
      .map((tag) => {
        if (!isRecord(tag)) return undefined;
        return toStringValue(tag.label);
      })
      .filter((item): item is string => typeof item === "string");
  }

  return {
    ...base,
    fullDescription: toStringValue(entity.fullDescription) ?? null,
    tags,
    country: parseCountrySummaryArray(entity.country),
    hikes: parseHikeArray(entity.hikes),
  };
}

function parseSpecialist(value: unknown): Specialist | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const base = parseSpecialistSummary(entity);
  if (!base) return null;

  const countryRelation = normalizeRelation(entity.country);

  return {
    ...base,
    bio: toStringValue(entity.bio) ?? null,
    country: parseCountrySummary(countryRelation),
    trips: parseTripArray(entity.trips),
  };
}

function parseCountryCombination(value: unknown): CountryCombination | null {
  const entity = normalizeEntity(value);
  if (!entity) return null;
  const id = toEntityId(entity.id) ?? toEntityId(entity.documentId);
  const name = toStringValue(entity.name);
  const slug = toStringValue(entity.slug);
  if (!id || !name || !slug) return null;

  return {
    id,
    documentId: toStringValue(entity.documentId),
    name,
    slug,
    description: toStringValue(entity.description) ?? null,
    minDays: toNumberValue(entity.minDays),
    optimalDays: toNumberValue(entity.optimalDays),
    routeDescription: toStringValue(entity.routeDescription) ?? null,
    countries: parseCountrySummaryArray(entity.countries),
  };
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendQueryValue(params, `${key}[${index}]`, item);
    });
    return;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      appendQueryValue(params, `${key}[${nestedKey}]`, nestedValue);
    });
    return;
  }

  params.append(key, String(value));
}

export function toStrapiQueryString(
  query?: Record<string, unknown>,
): string | undefined {
  if (!query) return undefined;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    appendQueryValue(params, key, value);
  });
  const serialized = params.toString();
  return serialized.length > 0 ? serialized : undefined;
}

export function stripRichText(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function formatCurrency(
  value: number | undefined,
  currency = "USD",
): string {
  if (value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function strapiFetch<T>(
  endpoint: string,
  options: StrapiFetchOptions = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    headers,
    next: { revalidate: options.revalidate ?? 120 },
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed: ${response.status} ${endpoint}`);
  }

  return (await response.json()) as T;
}

function extractArrayData(payload: StrapiEnvelope): unknown[] {
  if (!payload.data) return [];
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function extractSingleData(payload: StrapiEnvelope): unknown | null {
  if (!payload.data) return null;
  if (Array.isArray(payload.data)) return payload.data[0] ?? null;
  return payload.data;
}

export async function fetchCountries(
  filters?: CountryFilters,
): Promise<CountrySummary[]> {
  const query: Record<string, unknown> = {
    filters: buildCountryStrapiFilters(filters ?? {}),
    sort: ["name:asc"],
    populate: {
      heroImage: true,
    },
  };

  const queryString = toStrapiQueryString(query);
  const endpoint = queryString
    ? `/api/countries?${queryString}`
    : "/api/countries";
  const payload = await strapiFetch<StrapiEnvelope>(endpoint);

  return extractArrayData(payload)
    .map((entry) => parseCountrySummary(entry))
    .filter((entry): entry is CountrySummary => entry !== null);
}

export async function fetchCountryBySlug(slug: string): Promise<Country | null> {
  const query: Record<string, unknown> = {
    filters: { slug: { $eq: slug } },
    populate: {
      heroImage: true,
      parentCountry: {
        populate: {
          heroImage: true,
        },
      },
      regions: {
        populate: {
          heroImage: true,
        },
      },
      wonders: {
        populate: {
          heroImage: true,
        },
      },
      hikes: true,
      attractions: true,
      specialists: {
        populate: {
          profileImage: true,
        },
      },
      bestCombinedWith: {
        populate: {
          heroImage: true,
        },
      },
    },
  };

  const queryString = toStrapiQueryString(query);
  const endpoint = queryString
    ? `/api/countries?${queryString}`
    : "/api/countries";
  const payload = await strapiFetch<StrapiEnvelope>(endpoint);
  return parseCountry(extractSingleData(payload));
}

export async function fetchWonderBySlug(slug: string): Promise<Wonder | null> {
  const query: Record<string, unknown> = {
    filters: { slug: { $eq: slug } },
    populate: {
      heroImage: true,
      country: {
        populate: {
          heroImage: true,
        },
      },
      hikes: true,
    },
  };

  const queryString = toStrapiQueryString(query);
  const endpoint = queryString ? `/api/wonders?${queryString}` : "/api/wonders";
  const payload = await strapiFetch<StrapiEnvelope>(endpoint);
  return parseWonder(extractSingleData(payload));
}

export async function fetchSpecialists(params?: {
  type?: "local_advisor" | "community_leader";
}): Promise<SpecialistSummary[]> {
  const query: Record<string, unknown> = {
    sort: ["rating:desc", "name:asc"],
    populate: {
      profileImage: true,
      country: true,
    },
  };
  if (params?.type) {
    query.filters = { type: { $eq: params.type } };
  }

  const queryString = toStrapiQueryString(query);
  const endpoint = queryString
    ? `/api/specialists?${queryString}`
    : "/api/specialists";
  const payload = await strapiFetch<StrapiEnvelope>(endpoint);
  return extractArrayData(payload)
    .map((entry) => parseSpecialistSummary(entry))
    .filter((entry): entry is SpecialistSummary => entry !== null);
}

export async function fetchSpecialistBySlug(
  slug: string,
): Promise<Specialist | null> {
  const query: Record<string, unknown> = {
    filters: { slug: { $eq: slug } },
    populate: {
      profileImage: true,
      country: {
        populate: {
          heroImage: true,
        },
      },
      trips: true,
    },
  };

  const queryString = toStrapiQueryString(query);
  const endpoint = queryString
    ? `/api/specialists?${queryString}`
    : "/api/specialists";
  const payload = await strapiFetch<StrapiEnvelope>(endpoint);
  return parseSpecialist(extractSingleData(payload));
}

export async function fetchCountryCombinationBySlug(
  slug: string,
): Promise<CountryCombination | null> {
  const query: Record<string, unknown> = {
    filters: { slug: { $eq: slug } },
    populate: {
      countries: {
        populate: {
          heroImage: true,
        },
      },
    },
  };

  const queryString = toStrapiQueryString(query);
  const endpoint = queryString
    ? `/api/country-combinations?${queryString}`
    : "/api/country-combinations";
  const payload = await strapiFetch<StrapiEnvelope>(endpoint);
  return parseCountryCombination(extractSingleData(payload));
}
