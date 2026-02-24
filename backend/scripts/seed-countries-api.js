import process from "node:process";

const TOP_LEVEL_COUNTRIES = [
  { slug: "canada", isoCode: "CA", nameEn: "Canada", nameCs: "Kanada" },
  { slug: "usa", isoCode: "US", nameEn: "United States", nameCs: "USA" },
  { slug: "mexico", isoCode: "MX", nameEn: "Mexico", nameCs: "Mexiko" },
  { slug: "ecuador", isoCode: "EC", nameEn: "Ecuador", nameCs: "Ekvador" },
  {
    slug: "canary-islands",
    isoCode: "IC",
    nameEn: "Canary Islands",
    nameCs: "Kanarske ostrovy",
  },
  { slug: "italy", isoCode: "IT", nameEn: "Italy", nameCs: "Italie" },
  { slug: "slovenia", isoCode: "SI", nameEn: "Slovenia", nameCs: "Slovinsko" },
  { slug: "austria", isoCode: "AT", nameEn: "Austria", nameCs: "Rakousko" },
  {
    slug: "great-britain",
    isoCode: "GB",
    nameEn: "Great Britain",
    nameCs: "Velka Britanie",
  },
  { slug: "slovakia", isoCode: "SK", nameEn: "Slovakia", nameCs: "Slovensko" },
  { slug: "czechia", isoCode: "CZ", nameEn: "Czechia", nameCs: "Cesko" },
  { slug: "poland", isoCode: "PL", nameEn: "Poland", nameCs: "Polsko" },
  { slug: "germany", isoCode: "DE", nameEn: "Germany", nameCs: "Nemecko" },
  { slug: "switzerland", isoCode: "CH", nameEn: "Switzerland", nameCs: "Svycarsko" },
  { slug: "norway", isoCode: "NO", nameEn: "Norway", nameCs: "Norsko" },
  { slug: "thailand", isoCode: "TH", nameEn: "Thailand", nameCs: "Thajsko" },
  {
    slug: "philippines",
    isoCode: "PH",
    nameEn: "Philippines",
    nameCs: "Filipiny",
  },
  {
    slug: "united-arab-emirates",
    isoCode: "AE",
    nameEn: "United Arab Emirates",
    nameCs: "Arabske Emiraty",
  },
  { slug: "maldives", isoCode: "MV", nameEn: "Maldives", nameCs: "Maledivy" },
  { slug: "sri-lanka", isoCode: "LK", nameEn: "Sri Lanka", nameCs: "Sri Lanka" },
  {
    slug: "new-zealand",
    isoCode: "NZ",
    nameEn: "New Zealand",
    nameCs: "Novy Zeland",
  },
  { slug: "nepal", isoCode: "NP", nameEn: "Nepal", nameCs: "Nepal" },
  { slug: "mauritius", isoCode: "MU", nameEn: "Mauritius", nameCs: "Mauricius" },
  { slug: "reunion", isoCode: "RE", nameEn: "Reunion", nameCs: "Reunion" },
  { slug: "spain", isoCode: "ES", nameEn: "Spain", nameCs: "Spanelsko" },
  { slug: "luxembourg", isoCode: "LU", nameEn: "Luxembourg", nameCs: "Lucembursko" },
  { slug: "belgium", isoCode: "BE", nameEn: "Belgium", nameCs: "Belgie" },
  {
    slug: "netherlands",
    isoCode: "NL",
    nameEn: "Netherlands",
    nameCs: "Nizozemsko",
  },
  { slug: "france", isoCode: "FR", nameEn: "France", nameCs: "Francie" },
  { slug: "iceland", isoCode: "IS", nameEn: "Iceland", nameCs: "Island" },
];

const REGIONS = [
  {
    parentSlug: "canada",
    slug: "alberta",
    isoCode: "AB",
    nameEn: "Alberta",
    nameCs: "Alberta",
  },
  {
    parentSlug: "canada",
    slug: "british-columbia",
    isoCode: "BC",
    nameEn: "British Columbia",
    nameCs: "Britska Kolumbie",
  },
  {
    parentSlug: "usa",
    slug: "washington",
    isoCode: "WA",
    nameEn: "Washington",
    nameCs: "Washington",
  },
  {
    parentSlug: "usa",
    slug: "oregon",
    isoCode: "OR",
    nameEn: "Oregon",
    nameCs: "Oregon",
  },
  {
    parentSlug: "usa",
    slug: "nevada",
    isoCode: "NV",
    nameEn: "Nevada",
    nameCs: "Nevada",
  },
  {
    parentSlug: "usa",
    slug: "arizona",
    isoCode: "AZ",
    nameEn: "Arizona",
    nameCs: "Arizona",
  },
  {
    parentSlug: "usa",
    slug: "utah",
    isoCode: "UT",
    nameEn: "Utah",
    nameCs: "Utah",
  },
  {
    parentSlug: "mexico",
    slug: "sonora",
    isoCode: "SON",
    nameEn: "Sonora",
    nameCs: "Sonora",
  },
  {
    parentSlug: "ecuador",
    slug: "galapagos",
    isoCode: "GAL",
    nameEn: "Galapagos",
    nameCs: "Galapagy",
  },
  {
    parentSlug: "canary-islands",
    slug: "tenerife",
    isoCode: "TF",
    nameEn: "Tenerife",
    nameCs: "Tenerife",
  },
  {
    parentSlug: "canary-islands",
    slug: "gran-canaria",
    isoCode: "GC",
    nameEn: "Gran Canaria",
    nameCs: "Gran Canaria",
  },
  {
    parentSlug: "great-britain",
    slug: "england",
    isoCode: "ENG",
    nameEn: "England",
    nameCs: "Anglie",
  },
];

function normalizeUrl(url) {
  return url.replace(/\/+$/, "");
}

function getConfig() {
  const baseUrlRaw = process.env.DIRECTUS_URL;
  const token =
    process.env.DIRECTUS_ACCESS_TOKEN ??
    process.env.DIRECTUS_TOKEN ??
    process.env.NEXT_PUBLIC_DIRECTUS_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

  if (!baseUrlRaw || baseUrlRaw.trim().length === 0) {
    throw new Error("Missing DIRECTUS_URL environment variable.");
  }
  if (!token || token.trim().length === 0) {
    throw new Error("Missing DIRECTUS_ACCESS_TOKEN or DIRECTUS_TOKEN environment variable.");
  }

  return {
    baseUrl: normalizeUrl(baseUrlRaw),
    token,
  };
}

async function directusRequest(config, path, options = {}) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const responseText = await response.text();
  const parsed = responseText.length > 0 ? JSON.parse(responseText) : undefined;
  if (!response.ok) {
    throw new Error(
      `Directus request failed: ${response.status} ${path} ${responseText ? `- ${responseText}` : ""}`,
    );
  }
  return parsed;
}

async function getCountryBySlug(config, slug) {
  const search = new URLSearchParams();
  search.set("filter[slug][_eq]", slug);
  search.set("limit", "1");
  search.set("fields", "id,slug,parent_country_id");

  const payload = await directusRequest(config, `/items/countries?${search.toString()}`);
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows[0] ?? null;
}

async function upsertCountry(config, data, parentCountryId, isState, stats) {
  const existing = await getCountryBySlug(config, data.slug);
  const payload = {
    slug: data.slug,
    iso_code: data.isoCode,
    is_state: isState,
    enabled: true,
    parent_country_id: parentCountryId ?? null,
    name_en: data.nameEn,
    name_cs: data.nameCs,
  };

  if (existing?.id) {
    await directusRequest(config, `/items/countries/${encodeURIComponent(String(existing.id))}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    stats.updated += 1;
    return existing.id;
  }

  const created = await directusRequest(config, "/items/countries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const createdId = created?.data?.id;
  if (!createdId) {
    throw new Error(`Failed to create country/state ${data.slug}: missing id in response.`);
  }
  stats.created += 1;
  return createdId;
}

export async function seedCountries() {
  const config = getConfig();
  const stats = { created: 0, updated: 0 };
  const countryIdBySlug = new Map();

  for (const country of TOP_LEVEL_COUNTRIES) {
    const id = await upsertCountry(config, country, null, false, stats);
    countryIdBySlug.set(country.slug, id);
  }

  for (const region of REGIONS) {
    const parentCountryId = countryIdBySlug.get(region.parentSlug);
    if (!parentCountryId) {
      throw new Error(`Missing parent country ${region.parentSlug} for region ${region.slug}.`);
    }
    const id = await upsertCountry(config, region, parentCountryId, true, stats);
    countryIdBySlug.set(region.slug, id);
  }

  const allRequestedSlugs = [
    ...TOP_LEVEL_COUNTRIES.map((country) => country.slug),
    ...REGIONS.map((region) => region.slug),
  ];
  const missing = [];
  for (const slug of allRequestedSlugs) {
    const row = await getCountryBySlug(config, slug);
    if (!row?.id) {
      missing.push(slug);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Seed verification failed, missing slugs: ${missing.join(", ")}`);
  }

  console.info(
    `[seed-countries-api] Completed. Created: ${stats.created}, Updated: ${stats.updated}, Verified: ${allRequestedSlugs.length}`,
  );
}

const isDirectExecution = process.argv[1]?.endsWith("/seed-countries-api.js");

if (isDirectExecution) {
  seedCountries().catch((error) => {
    console.error("[seed-countries-api] Failed", error);
    process.exit(1);
  });
}
