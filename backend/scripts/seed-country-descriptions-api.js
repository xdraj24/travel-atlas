import process from 'node:process';

const COUNTRY_DESCRIPTIONS = [
  {
    slug: 'canada',
    descriptionEn:
      'Canada offers vast national parks, turquoise lakes, and long scenic drives through mountain and forest landscapes.',
    descriptionCs:
      'Kanada nabizi rozlehle narodni parky, tyrkysova jezera a dlouhe scenicke cesty horami a lesy.',
  },
  {
    slug: 'alberta',
    descriptionEn:
      'Alberta is a gateway to the Rockies with glacier lakes, wildlife viewing, and iconic routes around Banff and Jasper.',
    descriptionCs:
      'Alberta je branou do Skalnatych hor s ledovcovymi jezery, pozorovanim zvere a ikonickymi trasami kolem Banffu a Jasperu.',
  },
  {
    slug: 'british-columbia',
    descriptionEn:
      'British Columbia combines Pacific coastline, rainforest trails, and alpine adventures from Vancouver to interior peaks.',
    descriptionCs:
      'Britska Kolumbie kombinuje tichomorske pobrezi, traily v destnem lese a alpske zazitky od Vancouveru po vnitrni hory.',
  },
  {
    slug: 'usa',
    descriptionEn:
      'The United States spans deserts, alpine ranges, and ocean coasts with excellent roadtrip infrastructure for diverse itineraries.',
    descriptionCs:
      'USA nabizi pouste, vysoke horske masivy i oceanske pobrezi se skvelou roadtrip infrastrukturou pro ruznorode itinerare.',
  },
  {
    slug: 'washington',
    descriptionEn:
      'Washington pairs Pacific beaches, evergreen forests, and volcano panoramas with easy access to national parks.',
    descriptionCs:
      'Washington propojuje pacificke plaze, stale zelene lesy a vyhledy na sopky s dobrou dostupnosti narodnich parku.',
  },
  {
    slug: 'oregon',
    descriptionEn:
      'Oregon is known for dramatic coastline viewpoints, waterfall hikes, and volcanic lakes across compact driving distances.',
    descriptionCs:
      'Oregon je znamy dramatickymi vyhlidkami na pobrezi, turami k vodopadum a sopecnymi jezery v dobre sjizdnych vzdalenostech.',
  },
  {
    slug: 'nevada',
    descriptionEn:
      'Nevada delivers desert roadtrips, canyon landscapes, and wide open skies ideal for photography and stargazing.',
    descriptionCs:
      'Nevada nabizi poustni roadtripy, kaonove scenere a siroke otevrene nebe idealni pro fotografii a pozorovani hvezd.',
  },
  {
    slug: 'arizona',
    descriptionEn:
      'Arizona combines red-rock canyons, iconic Southwest trails, and year-round sunshine for active outdoor travel.',
    descriptionCs:
      'Arizona kombinuje cervene kaonove formace, ikonicke traily americkeho jihozapadu a celorocni slunecne pocasi.',
  },
  {
    slug: 'utah',
    descriptionEn:
      'Utah features world-class national parks, sandstone arches, and adventurous scenic drives through desert plateaus.',
    descriptionCs:
      'Utah nabizi spickove narodni parky, pisecne oblouky a dobrodruzne scenicke jizdy pres poustni planiny.',
  },
  {
    slug: 'mexico',
    descriptionEn:
      'Mexico blends vibrant culture, varied coastlines, and mountain interiors with rich food and flexible travel styles.',
    descriptionCs:
      'Mexiko spojuje zivou kulturu, ruznoroda pobrezi a horske vnitrozemi s vybornou gastronomii a flexibilnim stylem cestovani.',
  },
  {
    slug: 'sonora',
    descriptionEn:
      'Sonora combines Sonoran Desert scenery, Gulf of California coastline, and remote routes for off-the-beaten-path travel.',
    descriptionCs:
      'Sonora kombinuje krajinu Sonorske pouste, pobrezi Kalifornskeho zalivu a odlehle trasy pro mene obvykle cestovani.',
  },
  {
    slug: 'ecuador',
    descriptionEn:
      'Ecuador offers high Andean peaks, cloud forests, and Pacific access in a compact country with quick route transitions.',
    descriptionCs:
      'Ekvador nabizi vysoke andske vrcholy, mlzne lesy a pristup k Pacifiku v kompaktni zemi s rychlymi presuny.',
  },
  {
    slug: 'galapagos',
    descriptionEn:
      'Galapagos is a unique wildlife destination with volcanic islands, marine life encounters, and guided nature exploration.',
    descriptionCs:
      'Galapagy jsou unikatni wildlife destinace se sopecnymi ostrovy, setkanim s morskym zivotem a vedenym objevovanim prirody.',
  },
  {
    slug: 'canary-islands',
    descriptionEn:
      'The Canary Islands provide year-round sun, volcanic terrain, and island-hopping itineraries suitable for active and relaxed travel.',
    descriptionCs:
      'Kanarske ostrovy nabizeji celorocni slunce, sopecny teren a itinerare mezi ostrovy vhodne pro aktivni i pohodove cestovani.',
  },
  {
    slug: 'tenerife',
    descriptionEn:
      'Tenerife offers volcanic hiking around Teide, black-sand beaches, and varied microclimates across one island.',
    descriptionCs:
      'Tenerife nabizi sopecne traily kolem Teide, plaze s cernym piskem a ruzna mikroklimata na jednom ostrove.',
  },
  {
    slug: 'gran-canaria',
    descriptionEn:
      'Gran Canaria blends coastal resorts, inland mountain roads, and canyon viewpoints for balanced beach and roadtrip plans.',
    descriptionCs:
      'Gran Canaria kombinuje pobrezni resorty, horske silnice ve vnitrozemi a kaonove vyhlidky pro vyvazeny beach a roadtrip plan.',
  },
  {
    slug: 'italy',
    descriptionEn:
      'Italy offers alpine trekking, historic cities, and Mediterranean coastlines, making it ideal for multi-style itineraries.',
    descriptionCs:
      'Italie nabizi alpske treky, historicka mesta a stredomorske pobrezi, diky cemu je idealni pro vice stylu itineraru.',
  },
  {
    slug: 'slovenia',
    descriptionEn:
      'Slovenia is compact and scenic, with alpine lakes, karst caves, and green valleys connected by short drives.',
    descriptionCs:
      'Slovinsko je kompaktni a scenicke, s alpskymi jezery, krasovymi jeskynemi a zelenymi udolimi propojenymi kratkymi presuny.',
  },
  {
    slug: 'austria',
    descriptionEn:
      'Austria features high alpine routes, lake districts, and polished mountain infrastructure for year-round outdoor travel.',
    descriptionCs:
      'Rakousko nabizi vysoke alpske trasy, jezerni oblasti a kvalitni horskou infrastrukturu pro celorocni aktivni cestovani.',
  },
  {
    slug: 'great-britain',
    descriptionEn:
      'Great Britain combines historic towns, coastal cliffs, and countryside routes with easy public transport and road access.',
    descriptionCs:
      'Velka Britanie kombinuje historicka mesta, pobrezni utesy a venkovske trasy s dobrou dostupnosti verejnou dopravou i autem.',
  },
  {
    slug: 'england',
    descriptionEn:
      'England offers varied travel from national park hikes and seaside walks to cultural city breaks and heritage sites.',
    descriptionCs:
      'Anglie nabizi rozmanite cestovani od tur v narodnich parcich a pobreznich prochazek po kulturni pobyty ve mestech.',
  },
  {
    slug: 'slovakia',
    descriptionEn:
      'Slovakia is known for the High Tatras, mountain huts, and scenic valleys suited for hiking-focused itineraries.',
    descriptionCs:
      'Slovensko je zname Vysokymi Tatrami, horskymi chatami a malebnymi udolimi vhodnymi pro turisticky zamereny itinerar.',
  },
  {
    slug: 'czechia',
    descriptionEn:
      'Czechia combines sandstone landscapes, historical towns, and easy road and rail connections across compact distances.',
    descriptionCs:
      'Cesko kombinuje piskovcove krajiny, historicka mesta a snadna silnicni i zeleznicni spojeni na kratke vzdalenosti.',
  },
  {
    slug: 'poland',
    descriptionEn:
      'Poland offers Baltic coastlines, mountain ranges, and vibrant cities with strong value for multi-stop travel.',
    descriptionCs:
      'Polsko nabizi baltske pobrezi, horske oblasti a ziva mesta s vyhodnym pomerem cena vykon pro vice zastavek.',
  },
  {
    slug: 'germany',
    descriptionEn:
      'Germany provides efficient transport, alpine and forest escapes, and city culture suited for flexible route planning.',
    descriptionCs:
      'Nemecko nabizi efektivni dopravu, alpske i lesni oblasti a mestskou kulturu vhodnou pro flexibilni planovani tras.',
  },
  {
    slug: 'switzerland',
    descriptionEn:
      'Switzerland is a premium alpine destination with glacier views, lake towns, and world-class mountain transport.',
    descriptionCs:
      'Svycarsko je premium alpska destinace s vyhledy na ledovce, jezernimi mesty a spickovou horskou dopravou.',
  },
  {
    slug: 'norway',
    descriptionEn:
      'Norway features fjords, dramatic mountain roads, and midnight-sun landscapes ideal for nature-driven itineraries.',
    descriptionCs:
      'Norsko nabizi fjordy, dramaticke horske silnice a krajiny pulnocniho slunce idealni pro prirodne zamereny itinerar.',
  },
  {
    slug: 'thailand',
    descriptionEn:
      'Thailand blends tropical islands, jungle mountains, and rich street food culture with easy traveler logistics.',
    descriptionCs:
      'Thajsko spojuje tropicke ostrovy, dzungli v horach a bohatou street food kulturu s jednoduchou cestovatelskou logistikou.',
  },
  {
    slug: 'philippines',
    descriptionEn:
      'The Philippines offers island-hopping, coral reefs, and volcanic landscapes with strong beach and diving potential.',
    descriptionCs:
      'Filipiny nabizeji island hopping, koralove utesy a sopecne krajiny s velkym potencialem pro plaze i potapeni.',
  },
  {
    slug: 'united-arab-emirates',
    descriptionEn:
      'The United Arab Emirates combines modern cities, desert experiences, and warm winter escapes with excellent services.',
    descriptionCs:
      'Arabske Emiraty kombinuji moderni mesta, poustni zazitky a teplou zimni dovolenou s velmi kvalitnimi sluzbami.',
  },
  {
    slug: 'maldives',
    descriptionEn:
      'Maldives is a tropical archipelago known for white-sand islands, lagoons, and luxury to mid-range resort stays.',
    descriptionCs:
      'Maledivy jsou tropicke souostrovi zname bilymi plazemi, lagunami a pobyty od luxusnich po stredni kategorii resortu.',
  },
  {
    slug: 'sri-lanka',
    descriptionEn:
      'Sri Lanka combines surf beaches, tea highlands, and cultural heritage routes in a compact island setting.',
    descriptionCs:
      'Sri Lanka kombinuje surferske plaze, cajove vrchoviny a kulturni trasy v kompaktnim ostrovnim prostredi.',
  },
  {
    slug: 'new-zealand',
    descriptionEn:
      'New Zealand offers cinematic mountains, fiords, and roadtrip-ready nature routes across two contrasting islands.',
    descriptionCs:
      'Novy Zeland nabizi filmove hory, fjordy a roadtrip trasy v prirode napric dvema kontrastnimi ostrovy.',
  },
  {
    slug: 'nepal',
    descriptionEn:
      'Nepal is a classic trekking destination with Himalayan panoramas, mountain villages, and high-altitude adventure routes.',
    descriptionCs:
      'Nepal je klasicka trekkingova destinace s himalajskymi panoramaty, horskymi vesnicemi a vysokohorskymi dobrodruznymi trasami.',
  },
  {
    slug: 'mauritius',
    descriptionEn:
      'Mauritius pairs turquoise lagoons, volcanic interiors, and relaxed island logistics for beach and light hiking travel.',
    descriptionCs:
      'Mauricius propojuje tyrkysove laguny, sopecne vnitrozemi a pohodovou ostrovni logistiku pro plaze i lehci tury.',
  },
  {
    slug: 'reunion',
    descriptionEn:
      'Reunion offers rugged volcanic terrain, cirque valleys, and steep hiking routes in a lush tropical mountain setting.',
    descriptionCs:
      'Reunion nabizi drsny sopecny teren, kotliny cirque a strme turisticke trasy v bujnem tropickem horskem prostredi.',
  },
  {
    slug: 'spain',
    descriptionEn:
      'Spain combines Mediterranean beaches, mountain interiors, and vibrant cities for highly flexible roadtrip and active plans.',
    descriptionCs:
      'Spanelsko kombinuje stredomorske plaze, horske vnitrozemi a ziva mesta pro velmi flexibilni roadtrip i aktivni plan.',
  },
  {
    slug: 'luxembourg',
    descriptionEn:
      'Luxembourg offers compact travel with medieval towns, green valleys, and easy cross-border connections in Western Europe.',
    descriptionCs:
      'Lucembursko nabizi kompaktni cestovani se stredovekymi mesty, zelenymi udolimi a snadnym preshranicnim spojenim.',
  },
  {
    slug: 'belgium',
    descriptionEn:
      'Belgium blends historic city cores, coastal sections, and strong food culture suited for short and multi-city trips.',
    descriptionCs:
      'Belgie kombinuje historicka centra mest, pobrezni useky a silnou gastronomii vhodnou pro kratke i vice mestske cesty.',
  },
  {
    slug: 'netherlands',
    descriptionEn:
      'The Netherlands is ideal for easy-paced travel with cycling routes, canals, coastal dunes, and efficient transport.',
    descriptionCs:
      'Nizozemsko je idealni pro pohodove tempo cestovani s cyklotrasami, kanaly, pobreznimi dunami a efektivni dopravou.',
  },
  {
    slug: 'france',
    descriptionEn:
      'France offers alpine mountains, Atlantic and Mediterranean coasts, and cultural regions for diverse itinerary design.',
    descriptionCs:
      'Francie nabizi alpske hory, atlanticke i stredomorske pobrezi a kulturni regiony pro ruznorode planovani itineraru.',
  },
  {
    slug: 'iceland',
    descriptionEn:
      'Iceland features volcanoes, waterfalls, geothermal sites, and iconic ring-road adventures in dramatic northern landscapes.',
    descriptionCs:
      'Island nabizi sopky, vodopady, geotermalni lokality a ikonicke dobrodruzstvi po ring road v dramaticke severni krajine.',
  },
];

function normalizeUrl(url) {
  return url.replace(/\/+$/, '');
}

function getConfig() {
  const baseUrlRaw = process.env.DIRECTUS_URL;
  const token =
    process.env.DIRECTUS_ACCESS_TOKEN ??
    process.env.DIRECTUS_TOKEN ??
    process.env.NEXT_PUBLIC_DIRECTUS_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

  if (!baseUrlRaw || baseUrlRaw.trim().length === 0) {
    throw new Error('Missing DIRECTUS_URL environment variable.');
  }
  if (!token || token.trim().length === 0) {
    throw new Error('Missing DIRECTUS_ACCESS_TOKEN or DIRECTUS_TOKEN environment variable.');
  }

  return {
    baseUrl: normalizeUrl(baseUrlRaw),
    token,
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

async function directusRequest(config, path, options = {}) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const responseText = await response.text();
  const parsed = responseText.length > 0 ? safeJsonParse(responseText) : undefined;
  if (!response.ok) {
    throw new Error(
      `Directus request failed: ${response.status} ${path} ${responseText ? `- ${responseText}` : ''}`,
    );
  }
  return parsed;
}

async function getCountryBySlug(config, slug) {
  const search = new URLSearchParams();
  search.set('filter[slug][_eq]', slug);
  search.set('limit', '1');
  search.set('fields', 'id,slug,description_en,description_cs');

  const payload = await directusRequest(config, `/items/countries?${search.toString()}`);
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows[0] ?? null;
}

export async function seedCountryDescriptions() {
  const config = getConfig();
  const stats = { updated: 0, unchanged: 0 };
  const missing = [];

  for (const entry of COUNTRY_DESCRIPTIONS) {
    const existing = await getCountryBySlug(config, entry.slug);
    if (!existing?.id) {
      missing.push(entry.slug);
      continue;
    }

    const nextDescriptionEn = entry.descriptionEn.trim();
    const nextDescriptionCs = entry.descriptionCs.trim();
    const hasSameValues =
      existing.description_en === nextDescriptionEn &&
      existing.description_cs === nextDescriptionCs;

    if (hasSameValues) {
      stats.unchanged += 1;
      continue;
    }

    await directusRequest(config, `/items/countries/${encodeURIComponent(String(existing.id))}`, {
      method: 'PATCH',
      body: JSON.stringify({
        description_en: nextDescriptionEn,
        description_cs: nextDescriptionCs,
      }),
    });
    stats.updated += 1;
  }

  if (missing.length > 0) {
    throw new Error(`Missing countries for descriptions: ${missing.join(', ')}`);
  }

  const invalid = [];
  for (const entry of COUNTRY_DESCRIPTIONS) {
    const existing = await getCountryBySlug(config, entry.slug);
    const hasDescriptionEn =
      typeof existing?.description_en === 'string' && existing.description_en.trim().length > 0;
    const hasDescriptionCs =
      typeof existing?.description_cs === 'string' && existing.description_cs.trim().length > 0;

    if (!hasDescriptionEn || !hasDescriptionCs) {
      invalid.push(entry.slug);
    }
  }

  if (invalid.length > 0) {
    throw new Error(`Description verification failed for: ${invalid.join(', ')}`);
  }

  console.info(
    `[seed-country-descriptions-api] Completed. Updated: ${stats.updated}, Unchanged: ${stats.unchanged}, Verified: ${COUNTRY_DESCRIPTIONS.length}`,
  );
}

const isDirectExecution = process.argv[1]?.endsWith('/seed-country-descriptions-api.js');

if (isDirectExecution) {
  seedCountryDescriptions().catch((error) => {
    console.error('[seed-country-descriptions-api] Failed', error);
    process.exit(1);
  });
}
