const SUPPORTED_LOCALES = new Set(['cs', 'en']);
const DEFAULT_LOCALE = 'cs';
const SPECIALIST_TYPES = new Set(['local_advisor', 'community_leader']);

function asSingleValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toInteger(value) {
  const raw = asSingleValue(value);
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw !== 'string' || raw.trim().length === 0) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.trunc(parsed);
}

function toBoolean(value) {
  const raw = asSingleValue(value);
  if (typeof raw === 'boolean') return raw;
  if (typeof raw !== 'string') return undefined;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return undefined;
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string');
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function resolveLocale(value) {
  const raw = asSingleValue(value);
  if (typeof raw !== 'string') return DEFAULT_LOCALE;
  const normalized = raw.trim().toLowerCase();
  if (SUPPORTED_LOCALES.has(normalized)) {
    return normalized;
  }
  return DEFAULT_LOCALE;
}

function localizedValue(row, locale, field) {
  return locale === 'cs' ? row[`${field}_cs`] : row[`${field}_en`];
}

function localizedColumn(locale, field) {
  return locale === 'cs' ? `${field}_cs` : `${field}_en`;
}

function mapMedia(url, alt) {
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return {
    url,
    alternativeText: typeof alt === 'string' ? alt : null,
  };
}

function mapWonderSummary(row, locale) {
  return {
    id: row.id,
    name: localizedValue(row, locale, 'name'),
    slug: row.slug,
    shortDescription: localizedValue(row, locale, 'short_description') ?? null,
    heroImage: mapMedia(row.hero_image_url, row.hero_image_alt),
    locationLat: toNumber(row.location_lat),
    locationLng: toNumber(row.location_lng),
    hikingDifficulty: toNumber(row.hiking_difficulty),
    altitudeMeters: toNumber(row.altitude_meters),
    pregnancySafe: row.pregnancy_safe,
    infantSafe: row.infant_safe,
  };
}

function mapCountrySummary(row, locale, wonders = undefined) {
  return {
    id: row.id,
    name: localizedValue(row, locale, 'name'),
    slug: row.slug,
    isoCode: row.iso_code,
    isState: row.is_state,
    enabled: row.enabled,
    description: localizedValue(row, locale, 'description') ?? null,
    hikingLevel: toNumber(row.hiking_level),
    beachLevel: toNumber(row.beach_level),
    roadtripLevel: toNumber(row.roadtrip_level),
    minDays: toNumber(row.min_days),
    optimalDays: toNumber(row.optimal_days),
    avgAccommodationPrice: toNumber(row.avg_accommodation_price),
    avgFoodPricePerDay: toNumber(row.avg_food_price_per_day),
    pregnancySafe: row.pregnancy_safe,
    infantSafe: row.infant_safe,
    heroImage: mapMedia(row.hero_image_url, row.hero_image_alt),
    wonders,
  };
}

function mapHikeSummary(row, locale) {
  return {
    id: row.id,
    name: localizedValue(row, locale, 'name'),
    difficulty: toNumber(row.difficulty),
    elevationGain: toNumber(row.elevation_gain),
    distanceKm: toNumber(row.distance_km),
    durationHours: toNumber(row.duration_hours),
    bestSeason: localizedValue(row, locale, 'best_season'),
    description: localizedValue(row, locale, 'description') ?? null,
  };
}

function mapAttractionSummary(row, locale) {
  return {
    id: row.id,
    name: localizedValue(row, locale, 'name'),
    type: row.type,
    description: localizedValue(row, locale, 'description') ?? null,
  };
}

function mapSpecialistSummary(row, locale) {
  return {
    id: row.id,
    name: localizedValue(row, locale, 'name'),
    slug: row.slug,
    type: row.type,
    rating: toNumber(row.rating),
    languages: locale === 'cs' ? toStringArray(row.languages_cs) : toStringArray(row.languages_en),
    offersChat: row.offers_chat,
    offersTrips: row.offers_trips,
    tripPriceFrom: toNumber(row.trip_price_from),
    whatsappLink: row.whatsapp_link ?? null,
    instagramLink: row.instagram_link ?? null,
    profileImage: mapMedia(row.profile_image_url, row.profile_image_alt),
  };
}

function mapTripSummary(row, locale, startDates = []) {
  return {
    id: row.id,
    title: localizedValue(row, locale, 'title'),
    slug: row.slug,
    durationDays: toNumber(row.duration_days),
    price: toNumber(row.price),
    difficulty: toNumber(row.difficulty),
    maxGroupSize: toNumber(row.max_group_size),
    description: localizedValue(row, locale, 'description') ?? null,
    startDates,
  };
}

function mapCountryCombination(row, locale, countries) {
  return {
    id: row.id,
    name: localizedValue(row, locale, 'name'),
    slug: row.slug,
    description: localizedValue(row, locale, 'description') ?? null,
    minDays: toNumber(row.min_days),
    optimalDays: toNumber(row.optimal_days),
    routeDescription: localizedValue(row, locale, 'route_description') ?? null,
    countries,
  };
}

async function fetchWondersByCountryIds(database, countryIds, locale) {
  if (countryIds.length === 0) return new Map();
  const rows = await database('wonders')
    .select('*')
    .whereIn('country_id', countryIds)
    .orderBy(localizedColumn(locale, 'name'), 'asc');

  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.country_id)) {
      grouped.set(row.country_id, []);
    }
    grouped.get(row.country_id).push(mapWonderSummary(row, locale));
  }
  return grouped;
}

async function fetchCountries(database, query) {
  const locale = resolveLocale(query.locale);
  const minHiking = toInteger(query.minHiking);
  const minBeach = toInteger(query.minBeach);
  const minRoadtrip = toInteger(query.minRoadtrip);
  const maxFlight = toInteger(query.maxFlight);
  const maxAccommodation = toInteger(query.maxAccommodation);
  const maxFoodPerDay = toInteger(query.maxFoodPerDay);
  const maxBudget = toInteger(query.maxBudget);
  const pregnancySafe = toBoolean(query.pregnancySafe);
  const infantSafe = toBoolean(query.infantSafe);

  const baseQuery = database('countries')
    .select('*')
    .where({ is_state: false, enabled: true });

  if (typeof minHiking === 'number') {
    baseQuery.andWhere('hiking_level', '>=', minHiking);
  }
  if (typeof minBeach === 'number') {
    baseQuery.andWhere('beach_level', '>=', minBeach);
  }
  if (typeof minRoadtrip === 'number') {
    baseQuery.andWhere('roadtrip_level', '>=', minRoadtrip);
  }
  if (typeof pregnancySafe === 'boolean') {
    baseQuery.andWhere('pregnancy_safe', pregnancySafe);
  }
  if (typeof infantSafe === 'boolean') {
    baseQuery.andWhere('infant_safe', infantSafe);
  }
  if (typeof maxFlight === 'number') {
    baseQuery.andWhere('avg_cheap_flight_price', '<=', maxFlight);
  }
  if (typeof maxAccommodation === 'number') {
    baseQuery.andWhere('avg_accommodation_price', '<=', maxAccommodation);
  }
  if (typeof maxFoodPerDay === 'number') {
    baseQuery.andWhere('avg_food_price_per_day', '<=', maxFoodPerDay);
  }
  if (typeof maxBudget === 'number') {
    baseQuery
      .andWhere('avg_cheap_flight_price', '<=', maxBudget)
      .andWhere('avg_accommodation_price', '<=', maxBudget);
  }

  const rows = await baseQuery.orderBy(localizedColumn(locale, 'name'), 'asc');
  const wondersByCountry = await fetchWondersByCountryIds(
    database,
    rows.map((row) => row.id),
    locale,
  );

  return rows.map((row) => mapCountrySummary(row, locale, wondersByCountry.get(row.id) ?? []));
}

async function fetchCountryBySlug(database, slug, locale) {
  const countryRow = await database('countries')
    .select('*')
    .where({ slug, enabled: true })
    .first();

  if (!countryRow) return null;

  const [
    parentCountryRow,
    regionRows,
    wonderRows,
    hikeRows,
    attractionRows,
    specialistRows,
    bestCombinationRows,
  ] = await Promise.all([
    countryRow.parent_country_id
      ? database('countries')
          .select('*')
          .where({ id: countryRow.parent_country_id, enabled: true })
          .first()
      : Promise.resolve(null),
    database('countries')
      .select('*')
      .where({ parent_country_id: countryRow.id, enabled: true })
      .orderBy(localizedColumn(locale, 'name'), 'asc'),
    database('wonders')
      .select('*')
      .where({ country_id: countryRow.id })
      .orderBy(localizedColumn(locale, 'name'), 'asc'),
    database('hikes')
      .select('*')
      .where({ country_id: countryRow.id })
      .orderBy(localizedColumn(locale, 'name'), 'asc'),
    database('attractions')
      .select('*')
      .where({ country_id: countryRow.id })
      .orderBy(localizedColumn(locale, 'name'), 'asc'),
    database('specialist_featured_countries as sfc')
      .join('specialists as s', 's.id', 'sfc.specialist_id')
      .select('s.*', 'sfc.sort_order')
      .where('sfc.country_id', countryRow.id)
      .andWhere('s.enabled', true)
      .orderBy('sfc.sort_order', 'asc')
      .orderBy('s.rating', 'desc')
      .orderBy(localizedColumn(locale, 's.name'), 'asc'),
    database('country_best_combinations as cbc')
      .join('countries as c', 'c.id', 'cbc.related_country_id')
      .select('c.*', 'cbc.sort_order')
      .where('cbc.country_id', countryRow.id)
      .andWhere('c.enabled', true)
      .orderBy('cbc.sort_order', 'asc'),
  ]);

  return {
    ...mapCountrySummary(countryRow, locale, wonderRows.map((row) => mapWonderSummary(row, locale))),
    avgDirectFlightPrice: toNumber(countryRow.avg_direct_flight_price),
    avgCheapFlightPrice: toNumber(countryRow.avg_cheap_flight_price),
    geoJson: countryRow.geo_json,
    parentCountry: parentCountryRow ? mapCountrySummary(parentCountryRow, locale) : null,
    regions: regionRows.map((row) => mapCountrySummary(row, locale)),
    bestCombinedWith: bestCombinationRows.map((row) => mapCountrySummary(row, locale)),
    hikes: hikeRows.map((row) => mapHikeSummary(row, locale)),
    attractions: attractionRows.map((row) => mapAttractionSummary(row, locale)),
    specialists: specialistRows.map((row) => mapSpecialistSummary(row, locale)),
  };
}

async function fetchWonderBySlug(database, slug, locale) {
  const wonderRow = await database('wonders').select('*').where({ slug }).first();
  if (!wonderRow) return null;

  const [countryRow, hikeRows, tagRows] = await Promise.all([
    database('countries')
      .select('*')
      .where({ id: wonderRow.country_id, enabled: true })
      .first(),
    database('hikes')
      .select('*')
      .where({ wonder_id: wonderRow.id })
      .orderBy(localizedColumn(locale, 'name'), 'asc'),
    database('wonder_tags').select('*').where({ wonder_id: wonderRow.id }).orderBy('sort_order', 'asc'),
  ]);

  const tags = tagRows.map((row) => (locale === 'cs' ? row.label_cs : row.label_en));

  return {
    ...mapWonderSummary(wonderRow, locale),
    fullDescription: localizedValue(wonderRow, locale, 'full_description') ?? null,
    tags,
    country: countryRow ? [mapCountrySummary(countryRow, locale)] : [],
    hikes: hikeRows.map((row) => mapHikeSummary(row, locale)),
  };
}

async function fetchSpecialists(database, query) {
  const locale = resolveLocale(query.locale);
  const type = asSingleValue(query.type);

  const baseQuery = database('specialists').select('*').where({ enabled: true });
  if (typeof type === 'string' && SPECIALIST_TYPES.has(type)) {
    baseQuery.andWhere('type', type);
  }

  const rows = await baseQuery
    .orderBy('rating', 'desc')
    .orderBy(localizedColumn(locale, 'name'), 'asc');

  return rows.map((row) => mapSpecialistSummary(row, locale));
}

async function fetchSpecialistBySlug(database, slug, locale) {
  const specialistRow = await database('specialists')
    .select('*')
    .where({ slug, enabled: true })
    .first();

  if (!specialistRow) return null;

  const [countryRow, tripRows] = await Promise.all([
    specialistRow.country_id
      ? database('countries')
          .select('*')
          .where({ id: specialistRow.country_id, enabled: true })
          .first()
      : Promise.resolve(null),
    database('trips')
      .select('*')
      .where({ specialist_id: specialistRow.id })
      .orderBy(localizedColumn(locale, 'title'), 'asc'),
  ]);

  const tripIds = tripRows.map((row) => row.id);
  const startDateRows =
    tripIds.length === 0
      ? []
      : await database('trip_start_dates')
          .select('*')
          .whereIn('trip_id', tripIds)
          .orderBy('start_date', 'asc');

  const datesByTrip = new Map();
  for (const row of startDateRows) {
    if (!datesByTrip.has(row.trip_id)) {
      datesByTrip.set(row.trip_id, []);
    }
    datesByTrip.get(row.trip_id).push(row.start_date);
  }

  return {
    ...mapSpecialistSummary(specialistRow, locale),
    bio: localizedValue(specialistRow, locale, 'bio') ?? null,
    country: countryRow ? mapCountrySummary(countryRow, locale) : null,
    trips: tripRows.map((row) => mapTripSummary(row, locale, datesByTrip.get(row.id) ?? [])),
  };
}

async function fetchCountryCombinationBySlug(database, slug, locale) {
  const combinationRow = await database('country_combinations')
    .select('*')
    .where({ slug })
    .first();

  if (!combinationRow) return null;

  const countryRows = await database('country_combination_countries as ccc')
    .join('countries as c', 'c.id', 'ccc.country_id')
    .select('c.*', 'ccc.sort_order')
    .where('ccc.combination_id', combinationRow.id)
    .andWhere('c.enabled', true)
    .orderBy('ccc.sort_order', 'asc');

  return mapCountryCombination(
    combinationRow,
    locale,
    countryRows.map((row) => mapCountrySummary(row, locale)),
  );
}

export default {
  id: 'api',
  handler: (router, { database }) => {
    router.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        service: 'directus',
        timestamp: new Date().toISOString(),
      });
    });

    router.get('/countries', async (req, res, next) => {
      try {
        const data = await fetchCountries(database, req.query ?? {});
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    });

    router.get('/countries/:slug', async (req, res, next) => {
      try {
        const locale = resolveLocale(req.query?.locale);
        const data = await fetchCountryBySlug(database, req.params.slug, locale);
        if (!data) {
          res.status(404).json({ data: null });
          return;
        }
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    });

    router.get('/wonders/:slug', async (req, res, next) => {
      try {
        const locale = resolveLocale(req.query?.locale);
        const data = await fetchWonderBySlug(database, req.params.slug, locale);
        if (!data) {
          res.status(404).json({ data: null });
          return;
        }
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    });

    router.get('/specialists', async (req, res, next) => {
      try {
        const data = await fetchSpecialists(database, req.query ?? {});
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    });

    router.get('/specialists/:slug', async (req, res, next) => {
      try {
        const locale = resolveLocale(req.query?.locale);
        const data = await fetchSpecialistBySlug(database, req.params.slug, locale);
        if (!data) {
          res.status(404).json({ data: null });
          return;
        }
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    });

    router.get('/country-combinations/:slug', async (req, res, next) => {
      try {
        const locale = resolveLocale(req.query?.locale);
        const data = await fetchCountryCombinationBySlug(database, req.params.slug, locale);
        if (!data) {
          res.status(404).json({ data: null });
          return;
        }
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    });
  },
};
