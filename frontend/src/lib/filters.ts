export type SearchParamValue = string | string[] | undefined;
export type SearchParams = Record<string, SearchParamValue>;

export interface CountryFilters {
  minHiking?: number;
  minBeach?: number;
  minRoadtrip?: number;
  pregnancySafe?: boolean;
  infantSafe?: boolean;
  maxFlight?: number;
  maxAccommodation?: number;
  maxFoodPerDay?: number;
  maxBudget?: number;
}

function getSingleValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parsePositiveInt(value: SearchParamValue): number | undefined {
  const single = getSingleValue(value);
  if (!single) {
    return undefined;
  }
  const parsed = Number(single);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return Math.floor(parsed);
}

function parseBoolean(value: SearchParamValue): boolean | undefined {
  const single = getSingleValue(value);
  if (!single) {
    return undefined;
  }
  const normalized = single.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }
  return undefined;
}

export function parseCountryFilters(searchParams: SearchParams): CountryFilters {
  return {
    minHiking: parsePositiveInt(searchParams.minHiking),
    minBeach: parsePositiveInt(searchParams.minBeach),
    minRoadtrip: parsePositiveInt(searchParams.minRoadtrip),
    pregnancySafe: parseBoolean(searchParams.pregnancySafe),
    infantSafe: parseBoolean(searchParams.infantSafe),
    maxFlight: parsePositiveInt(searchParams.maxFlight),
    maxAccommodation: parsePositiveInt(searchParams.maxAccommodation),
    maxFoodPerDay: parsePositiveInt(searchParams.maxFoodPerDay),
    maxBudget: parsePositiveInt(searchParams.maxBudget),
  };
}

export function filtersToQueryString(filters: CountryFilters): string {
  const query = new URLSearchParams();
  if (filters.minHiking) query.set("minHiking", String(filters.minHiking));
  if (filters.minBeach) query.set("minBeach", String(filters.minBeach));
  if (filters.minRoadtrip)
    query.set("minRoadtrip", String(filters.minRoadtrip));
  if (typeof filters.pregnancySafe === "boolean") {
    query.set("pregnancySafe", String(filters.pregnancySafe));
  }
  if (typeof filters.infantSafe === "boolean") {
    query.set("infantSafe", String(filters.infantSafe));
  }
  if (filters.maxFlight) query.set("maxFlight", String(filters.maxFlight));
  if (filters.maxAccommodation) {
    query.set("maxAccommodation", String(filters.maxAccommodation));
  }
  if (filters.maxFoodPerDay) {
    query.set("maxFoodPerDay", String(filters.maxFoodPerDay));
  }
  if (filters.maxBudget) query.set("maxBudget", String(filters.maxBudget));
  return query.toString();
}
