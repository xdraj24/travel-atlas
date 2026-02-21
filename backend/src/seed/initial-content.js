'use strict';

const fs = require('fs/promises');
const os = require('os');
const path = require('path');

const IMAGE_SOURCES = {
  country_spain: {
    key: 'country-spain-hero',
    url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'City skyline in Spain during golden hour',
    credit: 'Pexels',
  },
  country_portugal: {
    key: 'country-portugal-hero',
    url: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Atlantic coastline cliffs in Portugal',
    credit: 'Pexels',
  },
  country_italy: {
    key: 'country-italy-hero',
    url: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Historic city scene in Italy',
    credit: 'Pexels',
  },
  country_france: {
    key: 'country-france-hero',
    url: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'French city landmark and skyline',
    credit: 'Pexels',
  },
  country_morocco: {
    key: 'country-morocco-hero',
    url: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Desert camp view in Morocco',
    credit: 'Pexels',
  },
  wonder_teide: {
    key: 'wonder-teide-hero',
    url: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Volcanic terrain and clouds in Tenerife',
    credit: 'Pexels',
  },
  wonder_tre_cime: {
    key: 'wonder-tre-cime-hero',
    url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Alpine mountains in Northern Italy',
    credit: 'Pexels',
  },
  wonder_sintra: {
    key: 'wonder-sintra-hero',
    url: 'https://images.pexels.com/photos/1619569/pexels-photo-1619569.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Forest hills and palace silhouette in Portugal',
    credit: 'Pexels',
  },
  specialist_lucia: {
    key: 'specialist-lucia-profile',
    url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Portrait of a smiling female travel specialist',
    credit: 'Pexels',
  },
  specialist_joao: {
    key: 'specialist-joao-profile',
    url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Portrait of a male outdoor guide',
    credit: 'Pexels',
  },
  specialist_giulia: {
    key: 'specialist-giulia-profile',
    url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Portrait of a female mountain guide',
    credit: 'Pexels',
  },
};

const COUNTRY_SEED = [
  {
    name: 'Spain',
    slug: 'spain',
    isoCode: 'ES',
    description:
      'Spain blends Atlantic cliffs, Mediterranean beaches, and mountain interiors. Popular routes pair cultural cities with national parks, making it one of Europe\'s most flexible destinations for roadtrips and active itineraries.',
    hikingLevel: 4,
    beachLevel: 5,
    roadtripLevel: 4,
    minDays: 6,
    optimalDays: 12,
    avgDirectFlightPrice: 620,
    avgCheapFlightPrice: 320,
    avgAccommodationPrice: 120,
    avgFoodPricePerDay: 45,
    pregnancySafe: true,
    infantSafe: true,
    image: 'country_spain',
    bestCombinedWith: ['portugal', 'france', 'morocco'],
  },
  {
    name: 'Portugal',
    slug: 'portugal',
    isoCode: 'PT',
    description:
      'Portugal is compact and easy to navigate, with dramatic coastal walks, surf-friendly beaches, and wine-region roadtrips. The country works especially well for first-time Europe trips with moderate budgets.',
    hikingLevel: 3,
    beachLevel: 5,
    roadtripLevel: 4,
    minDays: 5,
    optimalDays: 10,
    avgDirectFlightPrice: 610,
    avgCheapFlightPrice: 290,
    avgAccommodationPrice: 105,
    avgFoodPricePerDay: 40,
    pregnancySafe: true,
    infantSafe: true,
    image: 'country_portugal',
    bestCombinedWith: ['spain', 'france'],
  },
  {
    name: 'Italy',
    slug: 'italy',
    isoCode: 'IT',
    description:
      'Italy offers high-contrast itineraries: alpine trekking in the north, cultural capitals in the center, and coastal islands in the south. It is ideal for travelers mixing iconic landmarks with outdoor adventure.',
    hikingLevel: 5,
    beachLevel: 4,
    roadtripLevel: 5,
    minDays: 7,
    optimalDays: 14,
    avgDirectFlightPrice: 640,
    avgCheapFlightPrice: 340,
    avgAccommodationPrice: 130,
    avgFoodPricePerDay: 50,
    pregnancySafe: true,
    infantSafe: true,
    image: 'country_italy',
    bestCombinedWith: ['france', 'spain'],
  },
  {
    name: 'France',
    slug: 'france',
    isoCode: 'FR',
    description:
      'France supports almost every travel style, from Alpine summits to Atlantic surf towns and vineyard road loops. Distances are manageable by train or car, making multi-region itineraries simple to plan.',
    hikingLevel: 4,
    beachLevel: 4,
    roadtripLevel: 5,
    minDays: 6,
    optimalDays: 12,
    avgDirectFlightPrice: 680,
    avgCheapFlightPrice: 360,
    avgAccommodationPrice: 145,
    avgFoodPricePerDay: 55,
    pregnancySafe: true,
    infantSafe: true,
    image: 'country_france',
    bestCombinedWith: ['spain', 'italy', 'portugal'],
  },
  {
    name: 'Morocco',
    slug: 'morocco',
    isoCode: 'MA',
    description:
      'Morocco combines Atlas Mountain trekking, Atlantic coast breaks, and Sahara overnights. It is a strong choice for high-variety adventures with warm weather and shorter flight times from Southern Europe.',
    hikingLevel: 4,
    beachLevel: 3,
    roadtripLevel: 5,
    minDays: 6,
    optimalDays: 11,
    avgDirectFlightPrice: 590,
    avgCheapFlightPrice: 280,
    avgAccommodationPrice: 85,
    avgFoodPricePerDay: 32,
    pregnancySafe: false,
    infantSafe: false,
    image: 'country_morocco',
    bestCombinedWith: ['spain', 'portugal'],
  },
];

const REGION_SEED = [
  {
    name: 'Catalonia',
    slug: 'catalonia',
    isoCode: 'CT',
    description:
      'Catalonia pairs Mediterranean beaches with Pyrenean day hikes and a strong food culture around Barcelona and Girona.',
    hikingLevel: 4,
    beachLevel: 4,
    roadtripLevel: 4,
    minDays: 3,
    optimalDays: 7,
    avgDirectFlightPrice: 640,
    avgCheapFlightPrice: 300,
    avgAccommodationPrice: 130,
    avgFoodPricePerDay: 50,
    pregnancySafe: true,
    infantSafe: true,
    parentCountry: 'spain',
    image: 'country_spain',
  },
  {
    name: 'Andalusia',
    slug: 'andalusia',
    isoCode: 'AN',
    description:
      'Andalusia is known for white hill towns, warm-weather beaches, and easy drives between Seville, Granada, and Malaga.',
    hikingLevel: 3,
    beachLevel: 5,
    roadtripLevel: 4,
    minDays: 4,
    optimalDays: 8,
    avgDirectFlightPrice: 610,
    avgCheapFlightPrice: 280,
    avgAccommodationPrice: 95,
    avgFoodPricePerDay: 38,
    pregnancySafe: true,
    infantSafe: true,
    parentCountry: 'spain',
    image: 'country_spain',
  },
  {
    name: 'Canary Islands',
    slug: 'canary-islands',
    isoCode: 'IC',
    description:
      'The Canary Islands deliver year-round sun, volcanic landscapes, and family-friendly island-hopping itineraries.',
    hikingLevel: 4,
    beachLevel: 5,
    roadtripLevel: 3,
    minDays: 5,
    optimalDays: 9,
    avgDirectFlightPrice: 700,
    avgCheapFlightPrice: 360,
    avgAccommodationPrice: 115,
    avgFoodPricePerDay: 42,
    pregnancySafe: true,
    infantSafe: true,
    parentCountry: 'spain',
    image: 'wonder_teide',
  },
];

const WONDER_SEED = [
  {
    name: 'Teide National Park',
    slug: 'teide-national-park',
    shortDescription:
      'Spain\'s highest volcanic landscape with sunrise hikes above the cloud layer.',
    fullDescription:
      'Teide National Park is a high-altitude volcanic ecosystem with lava fields, crater viewpoints, and permit-based summit routes. It works best for travelers who want a challenging but highly scenic adventure day.',
    locationLat: 28.2724,
    locationLng: -16.6425,
    hikingDifficulty: 4,
    altitudeMeters: 3718,
    pregnancySafe: false,
    infantSafe: false,
    tags: ['volcano', 'sunrise', 'national-park'],
    countries: ['spain'],
    image: 'wonder_teide',
  },
  {
    name: 'Tre Cime di Lavaredo',
    slug: 'tre-cime-di-lavaredo',
    shortDescription: 'A classic Dolomites icon with dramatic limestone peaks.',
    fullDescription:
      'Tre Cime is one of the most recognizable alpine landscapes in Europe. The area has a range of loop trails from moderate scenic walks to steep ridge options with major panoramic payoff.',
    locationLat: 46.6268,
    locationLng: 12.3008,
    hikingDifficulty: 4,
    altitudeMeters: 2999,
    pregnancySafe: false,
    infantSafe: false,
    tags: ['alps', 'dolomites', 'photography'],
    countries: ['italy'],
    image: 'wonder_tre_cime',
  },
  {
    name: 'Pena Palace and Sintra Hills',
    slug: 'pena-palace-and-sintra-hills',
    shortDescription:
      'Forest-covered ridges and historic hilltop architecture near Lisbon.',
    fullDescription:
      'Sintra combines short forest trails, scenic lookouts, and landmark architecture. It is ideal for lighter hiking days with rich cultural stops and easy rail access from Lisbon.',
    locationLat: 38.7876,
    locationLng: -9.3904,
    hikingDifficulty: 2,
    altitudeMeters: 528,
    pregnancySafe: true,
    infantSafe: true,
    tags: ['forest', 'palace', 'day-trip'],
    countries: ['portugal'],
    image: 'wonder_sintra',
  },
];

const HIKE_SEED = [
  {
    name: 'Teide Summit Trail',
    difficulty: 4,
    elevationGain: 1400,
    distanceKm: 10.5,
    durationHours: 6,
    bestSeason: 'Spring to autumn',
    description:
      'A permit-based summit push across volcanic terrain with steep final sections and excellent sunrise conditions.',
    country: 'spain',
    wonder: 'teide-national-park',
  },
  {
    name: 'Tre Cime Panorama Circuit',
    difficulty: 3,
    elevationGain: 470,
    distanceKm: 9.8,
    durationHours: 4.5,
    bestSeason: 'June to September',
    description:
      'A classic Dolomites loop with wide alpine viewpoints and multiple rifugio stops for families and mixed-skill groups.',
    country: 'italy',
    wonder: 'tre-cime-di-lavaredo',
  },
  {
    name: 'Sintra Ridge and Castle Loop',
    difficulty: 2,
    elevationGain: 320,
    distanceKm: 8.2,
    durationHours: 3.2,
    bestSeason: 'Year-round',
    description:
      'A moderate route through mossy forest trails connecting Pena Palace viewpoints and old Sintra footpaths.',
    country: 'portugal',
    wonder: 'pena-palace-and-sintra-hills',
  },
  {
    name: 'Imlil to Toubkal Refuge Approach',
    difficulty: 3,
    elevationGain: 980,
    distanceKm: 11.4,
    durationHours: 5.8,
    bestSeason: 'Spring and autumn',
    description:
      'A strong acclimatization day through Atlas valleys and switchbacks, commonly used before Mount Toubkal summit attempts.',
    country: 'morocco',
  },
];

const ATTRACTION_SEED = [
  {
    name: 'Costa Brava Coastal Viewpoints',
    type: 'viewpoint',
    description:
      'A scenic chain of clifftop overlooks and hidden coves ideal for half-day roadtrip stops.',
    country: 'spain',
  },
  {
    name: 'Algarve Sea Caves',
    type: 'beach',
    description:
      'Boat-accessed caves and calm turquoise bays around Lagos and Benagil.',
    country: 'portugal',
  },
  {
    name: 'Val d\'Orcia Hill Towns',
    type: 'town',
    description:
      'A rolling Tuscany route connecting photogenic medieval villages and vineyard roads.',
    country: 'italy',
  },
  {
    name: 'Annecy Lakeside Promenade',
    type: 'town',
    description:
      'A relaxed alpine-lake town stop with easy bike paths and mountain skyline views.',
    country: 'france',
  },
  {
    name: 'Ouzoud Waterfalls',
    type: 'waterfall',
    description:
      'One of Morocco\'s most accessible waterfall systems, with river overlooks and light hiking paths.',
    country: 'morocco',
  },
];

const SPECIALIST_SEED = [
  {
    name: 'Lucia Moreno',
    slug: 'lucia-moreno',
    type: 'local_advisor',
    bio: 'Lucia builds family-friendly active itineraries across Southern Spain, balancing short scenic hikes with local food and culture.',
    country: 'spain',
    featuredInCountries: ['spain', 'portugal'],
    rating: 4.9,
    languages: ['Spanish', 'English'],
    offersChat: true,
    offersTrips: true,
    tripPriceFrom: 420,
    whatsappLink:
      'https://wa.me/34600000001?text=Hi%20Lucia%2C%20I%20would%20like%20help%20planning%20a%20trip',
    instagramLink: 'https://www.instagram.com/',
    image: 'specialist_lucia',
  },
  {
    name: 'Joao Santos',
    slug: 'joao-santos',
    type: 'community_leader',
    bio: 'Joao leads small-group routes along the Portuguese coast and mountain villages with a focus on community-owned stays.',
    country: 'portugal',
    featuredInCountries: ['portugal', 'spain', 'france'],
    rating: 4.8,
    languages: ['Portuguese', 'English', 'Spanish'],
    offersChat: true,
    offersTrips: true,
    tripPriceFrom: 390,
    whatsappLink:
      'https://wa.me/351910000001?text=Hi%20Joao%2C%20I%20am%20interested%20in%20your%20community%20trips',
    instagramLink: 'https://www.instagram.com/',
    image: 'specialist_joao',
  },
  {
    name: 'Giulia Conti',
    slug: 'giulia-conti',
    type: 'local_advisor',
    bio: 'Giulia focuses on Dolomites and Northern Italy routes for hikers who want strong logistics and medium-to-high difficulty trails.',
    country: 'italy',
    featuredInCountries: ['italy', 'france'],
    rating: 4.9,
    languages: ['Italian', 'English'],
    offersChat: true,
    offersTrips: true,
    tripPriceFrom: 510,
    whatsappLink:
      'https://wa.me/393330000001?text=Hi%20Giulia%2C%20please%20share%20your%20available%20mountain%20trips',
    instagramLink: 'https://www.instagram.com/',
    image: 'specialist_giulia',
  },
];

const TRIP_SEED = [
  {
    title: 'Andalusia Family Adventure Week',
    slug: 'andalusia-family-adventure-week',
    specialist: 'lucia-moreno',
    country: 'spain',
    durationDays: 7,
    price: 980,
    difficulty: 2,
    maxGroupSize: 8,
    description:
      'A balanced route with short hikes, white villages, and beach downtime designed for families and first-time Spain visitors.',
    startDates: ['2026-04-18', '2026-05-23', '2026-09-12'],
  },
  {
    title: 'Atlantic Villages and Cliffs Circuit',
    slug: 'atlantic-villages-and-cliffs-circuit',
    specialist: 'joao-santos',
    country: 'portugal',
    durationDays: 6,
    price: 860,
    difficulty: 2,
    maxGroupSize: 10,
    description:
      'A coastal Portugal circuit with boardwalk hikes, fishing villages, and small-group community experiences.',
    startDates: ['2026-03-20', '2026-06-14', '2026-10-02'],
  },
  {
    title: 'Dolomites Basecamp Trek',
    slug: 'dolomites-basecamp-trek',
    specialist: 'giulia-conti',
    country: 'italy',
    durationDays: 8,
    price: 1480,
    difficulty: 4,
    maxGroupSize: 6,
    description:
      'A high-scenery alpine week with refuge lunches, ridge viewpoints, and progressive acclimatization days.',
    startDates: ['2026-07-05', '2026-08-09', '2026-09-06'],
  },
];

const COUNTRY_COMBINATION_SEED = [
  {
    name: 'Iberian Atlantic Loop',
    slug: 'iberian-atlantic-loop',
    description:
      'A balanced route combining food cities, surf coasts, and medium-easy hikes across the Iberian Peninsula.',
    minDays: 10,
    optimalDays: 16,
    routeDescription:
      'Start in Porto, drive south through Lisbon and Algarve, cross into Andalusia, and finish in Madrid or Barcelona.',
    countries: ['portugal', 'spain'],
  },
  {
    name: 'Mediterranean to Alps Arc',
    slug: 'mediterranean-to-alps-arc',
    description:
      'Move from warm Mediterranean coastlines into high alpine terrain for a high-contrast Europe itinerary.',
    minDays: 12,
    optimalDays: 18,
    routeDescription:
      'Begin on the Spanish coast, continue through Southern France, then end with mountain trekking days in Northern Italy.',
    countries: ['spain', 'france', 'italy'],
  },
];

const ENTITY_UIDS = {
  country: 'api::country.country',
  wonder: 'api::wonder.wonder',
  hike: 'api::hike.hike',
  attraction: 'api::attraction.attraction',
  specialist: 'api::specialist.specialist',
  trip: 'api::trip.trip',
  combination: 'api::country-combination.country-combination',
};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function toExtFromUrl(url) {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname);
    return ext || '.jpg';
  } catch {
    return '.jpg';
  }
}

function toMimeType(ext) {
  const normalized = (ext || '').toLowerCase();
  if (normalized === '.png') return 'image/png';
  if (normalized === '.webp') return 'image/webp';
  if (normalized === '.gif') return 'image/gif';
  return 'image/jpeg';
}

function withPublishData(data) {
  return {
    ...data,
    publishedAt: new Date().toISOString(),
  };
}

async function findOneByField(strapi, uid, field, value) {
  if (strapi.entityService && typeof strapi.entityService.findMany === 'function') {
    const entries = await strapi.entityService.findMany(uid, {
      filters: { [field]: { $eq: value } },
      limit: 1,
    });
    return asArray(entries)[0] || null;
  }

  const entries = await strapi.db.query(uid).findMany({
    where: { [field]: value },
    limit: 1,
  });
  return asArray(entries)[0] || null;
}

async function createEntry(strapi, uid, data) {
  if (strapi.entityService && typeof strapi.entityService.create === 'function') {
    return strapi.entityService.create(uid, { data });
  }
  return strapi.db.query(uid).create({ data });
}

async function updateEntry(strapi, uid, id, data) {
  if (strapi.entityService && typeof strapi.entityService.update === 'function') {
    return strapi.entityService.update(uid, id, { data });
  }
  return strapi.db.query(uid).update({
    where: { id },
    data,
  });
}

async function upsertByField(strapi, uid, field, value, data) {
  const existing = await findOneByField(strapi, uid, field, value);
  const payload = withPublishData(data);
  if (existing && existing.id) {
    return updateEntry(strapi, uid, existing.id, payload);
  }
  return createEntry(strapi, uid, payload);
}

async function ensureImage(strapi, imageMeta, cache) {
  if (!imageMeta) return null;
  if (cache.has(imageMeta.key)) return cache.get(imageMeta.key);

  const ext = toExtFromUrl(imageMeta.url);
  const fileName = `${imageMeta.key}${ext}`;
  const fileQuery = strapi.db.query('plugin::upload.file');

  const existing = await fileQuery.findOne({
    where: {
      $or: [{ name: fileName }, { hash: imageMeta.key }],
    },
  });

  if (existing) {
    cache.set(imageMeta.key, existing);
    return existing;
  }

  const response = await fetch(imageMeta.url, {
    headers: {
      'user-agent': 'AdventureAtlasSeeder/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} for ${imageMeta.url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const tmpPath = path.join(
    os.tmpdir(),
    `adventure-atlas-${imageMeta.key}-${Date.now()}${ext}`,
  );

  await fs.writeFile(tmpPath, buffer);

  try {
    const uploaded = await strapi.plugin('upload').service('upload').upload({
      data: {
        fileInfo: {
          name: fileName,
          alternativeText: imageMeta.alt,
          caption: `${imageMeta.credit} royalty-free image (https://www.pexels.com/license/)`,
        },
      },
      files: {
        path: tmpPath,
        name: fileName,
        hash: imageMeta.key,
        type: response.headers.get('content-type') || toMimeType(ext),
        size: buffer.length,
      },
    });

    const uploadedFile = asArray(uploaded)[0] || null;
    if (uploadedFile) {
      cache.set(imageMeta.key, uploadedFile);
    }
    return uploadedFile;
  } finally {
    await fs.unlink(tmpPath).catch(() => {});
  }
}

function idFromEntry(entry) {
  if (!entry) return undefined;
  return entry.id;
}

function compactIds(values) {
  return values.filter(
    (value) =>
      (typeof value === 'number' && Number.isFinite(value)) ||
      (typeof value === 'string' && value.trim().length > 0),
  );
}

async function seedCountries(strapi, imageCache) {
  const countryBySlug = new Map();

  for (const country of COUNTRY_SEED) {
    const image = await ensureImage(strapi, IMAGE_SOURCES[country.image], imageCache).catch(
      (error) => {
        strapi.log.warn(`[seed] Failed to upload image for ${country.slug}: ${error.message}`);
        return null;
      },
    );

    const entry = await upsertByField(
      strapi,
      ENTITY_UIDS.country,
      'slug',
      country.slug,
      {
        name: country.name,
        slug: country.slug,
        isoCode: country.isoCode,
        description: country.description,
        hikingLevel: country.hikingLevel,
        beachLevel: country.beachLevel,
        roadtripLevel: country.roadtripLevel,
        minDays: country.minDays,
        optimalDays: country.optimalDays,
        avgDirectFlightPrice: country.avgDirectFlightPrice,
        avgCheapFlightPrice: country.avgCheapFlightPrice,
        avgAccommodationPrice: country.avgAccommodationPrice,
        avgFoodPricePerDay: country.avgFoodPricePerDay,
        pregnancySafe: country.pregnancySafe,
        infantSafe: country.infantSafe,
        isState: false,
        heroImage: idFromEntry(image),
      },
    );

    countryBySlug.set(country.slug, entry);
  }

  for (const region of REGION_SEED) {
    const image = await ensureImage(strapi, IMAGE_SOURCES[region.image], imageCache).catch(
      (error) => {
        strapi.log.warn(`[seed] Failed to upload image for ${region.slug}: ${error.message}`);
        return null;
      },
    );

    const parentCountryId = idFromEntry(countryBySlug.get(region.parentCountry));
    const entry = await upsertByField(
      strapi,
      ENTITY_UIDS.country,
      'slug',
      region.slug,
      {
        name: region.name,
        slug: region.slug,
        isoCode: region.isoCode,
        description: region.description,
        hikingLevel: region.hikingLevel,
        beachLevel: region.beachLevel,
        roadtripLevel: region.roadtripLevel,
        minDays: region.minDays,
        optimalDays: region.optimalDays,
        avgDirectFlightPrice: region.avgDirectFlightPrice,
        avgCheapFlightPrice: region.avgCheapFlightPrice,
        avgAccommodationPrice: region.avgAccommodationPrice,
        avgFoodPricePerDay: region.avgFoodPricePerDay,
        pregnancySafe: region.pregnancySafe,
        infantSafe: region.infantSafe,
        isState: true,
        parentCountry: parentCountryId,
        heroImage: idFromEntry(image),
      },
    );

    countryBySlug.set(region.slug, entry);
  }

  for (const country of COUNTRY_SEED) {
    const current = countryBySlug.get(country.slug);
    const relatedIds = compactIds(
      country.bestCombinedWith.map((slug) => idFromEntry(countryBySlug.get(slug))),
    );

    if (!current || !current.id) continue;

    await updateEntry(strapi, ENTITY_UIDS.country, current.id, withPublishData({
      bestCombinedWith: relatedIds,
    }));
  }

  return countryBySlug;
}

async function seedWonders(strapi, countryBySlug, imageCache) {
  const wonderBySlug = new Map();

  for (const wonder of WONDER_SEED) {
    const image = await ensureImage(strapi, IMAGE_SOURCES[wonder.image], imageCache).catch(
      (error) => {
        strapi.log.warn(`[seed] Failed to upload image for ${wonder.slug}: ${error.message}`);
        return null;
      },
    );

    const countryIds = compactIds(
      wonder.countries.map((slug) => idFromEntry(countryBySlug.get(slug))),
    );

    const entry = await upsertByField(
      strapi,
      ENTITY_UIDS.wonder,
      'slug',
      wonder.slug,
      {
        name: wonder.name,
        slug: wonder.slug,
        shortDescription: wonder.shortDescription,
        fullDescription: wonder.fullDescription,
        heroImage: idFromEntry(image),
        country: countryIds,
        locationLat: wonder.locationLat,
        locationLng: wonder.locationLng,
        hikingDifficulty: wonder.hikingDifficulty,
        altitudeMeters: wonder.altitudeMeters,
        pregnancySafe: wonder.pregnancySafe,
        infantSafe: wonder.infantSafe,
        tags: wonder.tags.map((label) => ({ label })),
      },
    );

    wonderBySlug.set(wonder.slug, entry);
  }

  return wonderBySlug;
}

async function seedHikes(strapi, countryBySlug, wonderBySlug) {
  for (const hike of HIKE_SEED) {
    const countryId = idFromEntry(countryBySlug.get(hike.country));
    if (!countryId) continue;

    const wonderId = hike.wonder ? idFromEntry(wonderBySlug.get(hike.wonder)) : undefined;

    await upsertByField(
      strapi,
      ENTITY_UIDS.hike,
      'name',
      hike.name,
      {
        name: hike.name,
        difficulty: hike.difficulty,
        elevationGain: hike.elevationGain,
        distanceKm: hike.distanceKm,
        durationHours: hike.durationHours,
        bestSeason: hike.bestSeason,
        description: hike.description,
        country: countryId,
        wonder: wonderId,
      },
    );
  }
}

async function seedAttractions(strapi, countryBySlug) {
  for (const attraction of ATTRACTION_SEED) {
    const countryId = idFromEntry(countryBySlug.get(attraction.country));
    if (!countryId) continue;

    await upsertByField(
      strapi,
      ENTITY_UIDS.attraction,
      'name',
      attraction.name,
      {
        name: attraction.name,
        type: attraction.type,
        description: attraction.description,
        country: countryId,
      },
    );
  }
}

async function seedSpecialists(strapi, countryBySlug, imageCache) {
  const specialistBySlug = new Map();

  for (const specialist of SPECIALIST_SEED) {
    const image = await ensureImage(strapi, IMAGE_SOURCES[specialist.image], imageCache).catch(
      (error) => {
        strapi.log.warn(`[seed] Failed to upload image for ${specialist.slug}: ${error.message}`);
        return null;
      },
    );

    const countryId = idFromEntry(countryBySlug.get(specialist.country));
    const featuredCountryIds = compactIds(
      specialist.featuredInCountries.map((slug) => idFromEntry(countryBySlug.get(slug))),
    );

    const entry = await upsertByField(
      strapi,
      ENTITY_UIDS.specialist,
      'slug',
      specialist.slug,
      {
        name: specialist.name,
        slug: specialist.slug,
        type: specialist.type,
        bio: specialist.bio,
        profileImage: idFromEntry(image),
        country: countryId,
        rating: specialist.rating,
        languages: specialist.languages,
        offersChat: specialist.offersChat,
        offersTrips: specialist.offersTrips,
        tripPriceFrom: specialist.tripPriceFrom,
        whatsappLink: specialist.whatsappLink,
        instagramLink: specialist.instagramLink,
        featuredInCountries: featuredCountryIds,
      },
    );

    specialistBySlug.set(specialist.slug, entry);
  }

  return specialistBySlug;
}

async function seedTrips(strapi, specialistBySlug, countryBySlug) {
  for (const trip of TRIP_SEED) {
    const specialistId = idFromEntry(specialistBySlug.get(trip.specialist));
    const countryId = idFromEntry(countryBySlug.get(trip.country));
    if (!specialistId || !countryId) continue;

    await upsertByField(
      strapi,
      ENTITY_UIDS.trip,
      'slug',
      trip.slug,
      {
        title: trip.title,
        slug: trip.slug,
        specialist: specialistId,
        country: countryId,
        durationDays: trip.durationDays,
        price: trip.price,
        difficulty: trip.difficulty,
        maxGroupSize: trip.maxGroupSize,
        description: trip.description,
        startDates: trip.startDates.map((date) => ({ date })),
      },
    );
  }
}

async function seedCountryCombinations(strapi, countryBySlug) {
  for (const combination of COUNTRY_COMBINATION_SEED) {
    const countryIds = compactIds(
      combination.countries.map((slug) => idFromEntry(countryBySlug.get(slug))),
    );

    await upsertByField(
      strapi,
      ENTITY_UIDS.combination,
      'slug',
      combination.slug,
      {
        name: combination.name,
        slug: combination.slug,
        description: combination.description,
        minDays: combination.minDays,
        optimalDays: combination.optimalDays,
        routeDescription: combination.routeDescription,
        countries: countryIds,
      },
    );
  }
}

async function runInitialContentSeed(strapi) {
  const imageCache = new Map();

  strapi.log.info('[seed] Bootstrapping initial countries, trips, and images');
  strapi.log.info('[seed] Using royalty-free images licensed via Pexels');

  const countryBySlug = await seedCountries(strapi, imageCache);
  const wonderBySlug = await seedWonders(strapi, countryBySlug, imageCache);

  await seedHikes(strapi, countryBySlug, wonderBySlug);
  await seedAttractions(strapi, countryBySlug);

  const specialistBySlug = await seedSpecialists(strapi, countryBySlug, imageCache);
  await seedTrips(strapi, specialistBySlug, countryBySlug);
  await seedCountryCombinations(strapi, countryBySlug);

  strapi.log.info('[seed] Initial content seeding complete');
}

module.exports = {
  runInitialContentSeed,
};
