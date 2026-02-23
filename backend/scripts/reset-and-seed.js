import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { Client } from 'pg';

const IMAGE_SOURCES = {
  country_spain: {
    url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'City skyline in Spain during golden hour',
  },
  country_portugal: {
    url: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Atlantic coastline cliffs in Portugal',
  },
  country_italy: {
    url: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Historic city scene in Italy',
  },
  country_france: {
    url: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'French city landmark and skyline',
  },
  country_morocco: {
    url: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Desert camp view in Morocco',
  },
  wonder_teide: {
    url: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Volcanic terrain and clouds in Tenerife',
  },
  wonder_tre_cime: {
    url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Alpine mountains in Northern Italy',
  },
  wonder_sintra: {
    url: 'https://images.pexels.com/photos/1619569/pexels-photo-1619569.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Forest hills and palace silhouette in Portugal',
  },
  specialist_lucia: {
    url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Portrait of a smiling female travel specialist',
  },
  specialist_joao: {
    url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Portrait of a male outdoor guide',
  },
  specialist_giulia: {
    url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Portrait of a female mountain guide',
  },
};

const COUNTRY_SEED = [
  {
    slug: 'spain',
    isoCode: 'ES',
    image: 'country_spain',
    nameEn: 'Spain',
    nameCs: 'Spanelsko',
    descriptionEn:
      "Spain blends Atlantic cliffs, Mediterranean beaches, and mountain interiors. Popular routes pair cultural cities with national parks, making it one of Europe's most flexible destinations for roadtrips and active itineraries.",
    descriptionCs:
      'Spanelsko kombinuje atlanticke utesy, stredomorske plaze a horske vnitrozemi. Oblibene trasy propojuji kulturni mesta s narodnimi parky.',
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
  },
  {
    slug: 'portugal',
    isoCode: 'PT',
    image: 'country_portugal',
    nameEn: 'Portugal',
    nameCs: 'Portugalsko',
    descriptionEn:
      'Portugal is compact and easy to navigate, with dramatic coastal walks, surf-friendly beaches, and wine-region roadtrips.',
    descriptionCs:
      'Portugalsko je kompaktni a snadno dostupne, s dramatickymi pobreznimi stezkami, plazemi vhodnymi pro surf a vinarskymi roadtripy.',
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
  },
  {
    slug: 'italy',
    isoCode: 'IT',
    image: 'country_italy',
    nameEn: 'Italy',
    nameCs: 'Italie',
    descriptionEn:
      'Italy offers high-contrast itineraries: alpine trekking in the north, cultural capitals in the center, and coastal islands in the south.',
    descriptionCs:
      'Italie nabizi kontrastni itinerare: alpsky trekking na severu, kulturni metropole ve stredu a pobrezni ostrovy na jihu.',
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
  },
  {
    slug: 'france',
    isoCode: 'FR',
    image: 'country_france',
    nameEn: 'France',
    nameCs: 'Francie',
    descriptionEn:
      'France supports almost every travel style, from Alpine summits to Atlantic surf towns and vineyard road loops.',
    descriptionCs:
      'Francie podporuje temer kazdy styl cestovani, od alpskych vrcholu pres atlanticka surferska mesta az po vinarske okruhy autem.',
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
  },
  {
    slug: 'morocco',
    isoCode: 'MA',
    image: 'country_morocco',
    nameEn: 'Morocco',
    nameCs: 'Maroko',
    descriptionEn:
      'Morocco combines Atlas Mountain trekking, Atlantic coast breaks, and Sahara overnights.',
    descriptionCs:
      'Maroko spojuje treky v pohori Atlas, odpocinek na atlantickem pobrezi a prenocovani na Sahare.',
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
  },
];

const REGION_SEED = [
  {
    slug: 'catalonia',
    isoCode: 'CT',
    parentSlug: 'spain',
    image: 'country_spain',
    nameEn: 'Catalonia',
    nameCs: 'Katalansko',
    descriptionEn:
      'Catalonia pairs Mediterranean beaches with Pyrenean day hikes and a strong food culture around Barcelona and Girona.',
    descriptionCs:
      'Katalansko propojuje stredomorske plaze s jednodennimi turami v Pyrenejich a silnou gastronomii kolem Barcelony a Girony.',
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
  },
  {
    slug: 'andalusia',
    isoCode: 'AN',
    parentSlug: 'spain',
    image: 'country_spain',
    nameEn: 'Andalusia',
    nameCs: 'Andalusie',
    descriptionEn:
      'Andalusia is known for white hill towns, warm-weather beaches, and easy drives between Seville, Granada, and Malaga.',
    descriptionCs:
      'Andalusie je znama bilymi mestecky na kopcich, plazemi v teplem podnebi a snadnym cestovanim autem mezi Sevillou, Granadou a Malagou.',
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
  },
  {
    slug: 'canary-islands',
    isoCode: 'IC',
    parentSlug: 'spain',
    image: 'wonder_teide',
    nameEn: 'Canary Islands',
    nameCs: 'Kanarske ostrovy',
    descriptionEn:
      'The Canary Islands deliver year-round sun, volcanic landscapes, and family-friendly island-hopping itineraries.',
    descriptionCs:
      'Kanarske ostrovy nabizeji celorocni slunce, sopecnou krajinu a rodinne pristupne itinerare mezi ostrovy.',
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
  },
];

const BEST_COMBINATIONS = {
  spain: ['portugal', 'france', 'morocco'],
  portugal: ['spain', 'france'],
  italy: ['france', 'spain'],
  france: ['spain', 'italy', 'portugal'],
  morocco: ['spain', 'portugal'],
};

const WONDER_SEED = [
  {
    slug: 'teide-national-park',
    countrySlug: 'spain',
    image: 'wonder_teide',
    nameEn: 'Teide National Park',
    nameCs: 'Narodni park Teide',
    shortDescriptionEn: "Spain's highest volcanic landscape with sunrise hikes above the cloud layer.",
    shortDescriptionCs:
      'Nejvyssi spanelska sopecna krajina s vychody slunce nad vrstvou mraku.',
    fullDescriptionEn:
      'Teide National Park is a high-altitude volcanic ecosystem with lava fields, crater viewpoints, and permit-based summit routes.',
    fullDescriptionCs:
      'Narodni park Teide je vysokohorsky sopecny ekosystem s lavovymi poli, vyhledy do krateru a permitovymi trasami na vrchol.',
    locationLat: 28.2724,
    locationLng: -16.6425,
    hikingDifficulty: 4,
    altitudeMeters: 3718,
    pregnancySafe: false,
    infantSafe: false,
    tagsEn: ['volcano', 'sunrise', 'national-park'],
    tagsCs: ['sopka', 'vychod-slunce', 'narodni-park'],
  },
  {
    slug: 'tre-cime-di-lavaredo',
    countrySlug: 'italy',
    image: 'wonder_tre_cime',
    nameEn: 'Tre Cime di Lavaredo',
    nameCs: 'Tre Cime di Lavaredo',
    shortDescriptionEn: 'A classic Dolomites icon with dramatic limestone peaks.',
    shortDescriptionCs: 'Klasicka ikona Dolomit s dramatickymi vapencovymi stity.',
    fullDescriptionEn:
      'Tre Cime is one of the most recognizable alpine landscapes in Europe with loop trails from moderate walks to steep ridge options.',
    fullDescriptionCs:
      'Tre Cime patri mezi nejrozpoznatelnejsi alpske scenerie v Evrope. Oblast nabizi okruhy od stredne narocnych prochazek az po prudsi hrebenove varianty.',
    locationLat: 46.6268,
    locationLng: 12.3008,
    hikingDifficulty: 4,
    altitudeMeters: 2999,
    pregnancySafe: false,
    infantSafe: false,
    tagsEn: ['alps', 'dolomites', 'photography'],
    tagsCs: ['alpy', 'dolomity', 'fotografie'],
  },
  {
    slug: 'pena-palace-and-sintra-hills',
    countrySlug: 'portugal',
    image: 'wonder_sintra',
    nameEn: 'Pena Palace and Sintra Hills',
    nameCs: 'Palac Pena a sintrske kopce',
    shortDescriptionEn: 'Forest-covered ridges and historic hilltop architecture near Lisbon.',
    shortDescriptionCs: 'Lesnate hrebety a historicka architektura na kopcich nedaleko Lisabonu.',
    fullDescriptionEn:
      'Sintra combines short forest trails, scenic lookouts, and landmark architecture. It is ideal for lighter hiking days with rich cultural stops.',
    fullDescriptionCs:
      'Sintra kombinuje kratke lesni stezky, scenicke vyhlidky a vyznamnou pamatkovou architekturu. Je idealni pro lehci turisticke dny s kulturnimi zastavkami.',
    locationLat: 38.7876,
    locationLng: -9.3904,
    hikingDifficulty: 2,
    altitudeMeters: 528,
    pregnancySafe: true,
    infantSafe: true,
    tagsEn: ['forest', 'palace', 'day-trip'],
    tagsCs: ['les', 'palac', 'jednodenni-vylet'],
  },
];

const HIKE_SEED = [
  {
    countrySlug: 'spain',
    wonderSlug: 'teide-national-park',
    nameEn: 'Teide Summit Trail',
    nameCs: 'Vrcholova trasa Teide',
    difficulty: 4,
    elevationGain: 1400,
    distanceKm: 10.5,
    durationHours: 6,
    bestSeasonEn: 'Spring to autumn',
    bestSeasonCs: 'Jaro az podzim',
    descriptionEn:
      'A permit-based summit push across volcanic terrain with steep final sections and excellent sunrise conditions.',
    descriptionCs:
      'Vrcholova trasa na povoleni pres sopecny teren se strmym zaverem a vybornymi podminkami pro vychod slunce.',
  },
  {
    countrySlug: 'italy',
    wonderSlug: 'tre-cime-di-lavaredo',
    nameEn: 'Tre Cime Panorama Circuit',
    nameCs: 'Panoramaticky okruh Tre Cime',
    difficulty: 3,
    elevationGain: 470,
    distanceKm: 9.8,
    durationHours: 4.5,
    bestSeasonEn: 'June to September',
    bestSeasonCs: 'Cerven az zari',
    descriptionEn:
      'A classic Dolomites loop with wide alpine viewpoints and multiple rifugio stops for families and mixed-skill groups.',
    descriptionCs:
      'Klasicky dolomitsky okruh se sirokymi alpskymi vyhledy a vice rifugio zastavkami vhodny pro rodiny i skupiny s ruznou vykonnosti.',
  },
  {
    countrySlug: 'portugal',
    wonderSlug: 'pena-palace-and-sintra-hills',
    nameEn: 'Sintra Ridge and Castle Loop',
    nameCs: 'Hrebenovy a zamecky okruh Sintra',
    difficulty: 2,
    elevationGain: 320,
    distanceKm: 8.2,
    durationHours: 3.2,
    bestSeasonEn: 'Year-round',
    bestSeasonCs: 'Celorocne',
    descriptionEn:
      'A moderate route through mossy forest trails connecting Pena Palace viewpoints and old Sintra footpaths.',
    descriptionCs:
      'Stredne lehka trasa mechovitymi lesnimi stezkami propojujici vyhlidky u palace Pena a stare sintrske pesi cesty.',
  },
  {
    countrySlug: 'morocco',
    wonderSlug: null,
    nameEn: 'Imlil to Toubkal Refuge Approach',
    nameCs: 'Vystup z Imlilu k chate Toubkal',
    difficulty: 3,
    elevationGain: 980,
    distanceKm: 11.4,
    durationHours: 5.8,
    bestSeasonEn: 'Spring and autumn',
    bestSeasonCs: 'Jaro a podzim',
    descriptionEn:
      'A strong acclimatization day through Atlas valleys and switchbacks, commonly used before Mount Toubkal summit attempts.',
    descriptionCs:
      'Silny aklimatizacni den pres udoli Atlasu a serpentiny, casto vyuzivany pred pokusy o vrchol Jebel Toubkal.',
  },
];

const ATTRACTION_SEED = [
  {
    countrySlug: 'spain',
    type: 'viewpoint',
    nameEn: 'Costa Brava Coastal Viewpoints',
    nameCs: 'Pobrezni vyhlidky Costa Brava',
    descriptionEn:
      'A scenic chain of clifftop overlooks and hidden coves ideal for half-day roadtrip stops.',
    descriptionCs:
      'Fotogenicka rada vyhlidek na utesu a skrytych zatok idealni pro zastavky behem puldenniho roadtripu.',
  },
  {
    countrySlug: 'portugal',
    type: 'beach',
    nameEn: 'Algarve Sea Caves',
    nameCs: 'Morske jeskyne Algarve',
    descriptionEn: 'Boat-accessed caves and calm turquoise bays around Lagos and Benagil.',
    descriptionCs: 'Jeskyne pristupne lodi a klidne tyrkysove zatoky v okoli Lagosu a Benagilu.',
  },
  {
    countrySlug: 'italy',
    type: 'town',
    nameEn: "Val d'Orcia Hill Towns",
    nameCs: "Kopcova mestecka Val d'Orcia",
    descriptionEn:
      'A rolling Tuscany route connecting photogenic medieval villages and vineyard roads.',
    descriptionCs:
      'Zvlnena trasa Toskanskem propojujici fotogenicka stredoveka mestecka a vinarske silnice.',
  },
  {
    countrySlug: 'france',
    type: 'town',
    nameEn: 'Annecy Lakeside Promenade',
    nameCs: 'Jezerni promenada v Annecy',
    descriptionEn:
      'A relaxed alpine-lake town stop with easy bike paths and mountain skyline views.',
    descriptionCs:
      'Uvolnene alpske jezerne mesto s jednoduchymi cyklostezkami a vyhledy na horsky horizont.',
  },
  {
    countrySlug: 'morocco',
    type: 'waterfall',
    nameEn: 'Ouzoud Waterfalls',
    nameCs: 'Vodopady Ouzoud',
    descriptionEn:
      "One of Morocco's most accessible waterfall systems, with river overlooks and light hiking paths.",
    descriptionCs:
      'Jedna z nejdostupnejsich soustav vodopadu v Maroku s vyhledy na reku a lehkymi turistickymi stezkami.',
  },
];

const SPECIALIST_SEED = [
  {
    slug: 'lucia-moreno',
    image: 'specialist_lucia',
    type: 'local_advisor',
    countrySlug: 'spain',
    featuredInCountries: ['spain', 'portugal'],
    nameEn: 'Lucia Moreno',
    nameCs: 'Lucia Moreno',
    bioEn:
      'Lucia builds family-friendly active itineraries across Southern Spain, balancing short scenic hikes with local food and culture.',
    bioCs:
      'Lucia sestavuje rodinne pristupne aktivni itinerare po jiznim Spanelsku, kde vyvazuje kratke scenicke tury s mistni gastronomii a kulturou.',
    rating: 4.9,
    languagesEn: ['Spanish', 'English'],
    languagesCs: ['Spanelstina', 'Anglictina'],
    offersChat: true,
    offersTrips: true,
    tripPriceFrom: 420,
    whatsappLink:
      'https://wa.me/34600000001?text=Hi%20Lucia%2C%20I%20would%20like%20help%20planning%20a%20trip',
    instagramLink: 'https://www.instagram.com/',
  },
  {
    slug: 'joao-santos',
    image: 'specialist_joao',
    type: 'community_leader',
    countrySlug: 'portugal',
    featuredInCountries: ['portugal', 'spain', 'france'],
    nameEn: 'Joao Santos',
    nameCs: 'Joao Santos',
    bioEn:
      'Joao leads small-group routes along the Portuguese coast and mountain villages with a focus on community-owned stays.',
    bioCs:
      'Joao vede male skupiny po portugalskem pobrezi a horskych vesnicich se zamerenim na komunitne vlastnene ubytovani.',
    rating: 4.8,
    languagesEn: ['Portuguese', 'English', 'Spanish'],
    languagesCs: ['Portugalstina', 'Anglictina', 'Spanelstina'],
    offersChat: true,
    offersTrips: true,
    tripPriceFrom: 390,
    whatsappLink:
      'https://wa.me/351910000001?text=Hi%20Joao%2C%20I%20am%20interested%20in%20your%20community%20trips',
    instagramLink: 'https://www.instagram.com/',
  },
  {
    slug: 'giulia-conti',
    image: 'specialist_giulia',
    type: 'local_advisor',
    countrySlug: 'italy',
    featuredInCountries: ['italy', 'france'],
    nameEn: 'Giulia Conti',
    nameCs: 'Giulia Conti',
    bioEn:
      'Giulia focuses on Dolomites and Northern Italy routes for hikers who want strong logistics and medium-to-high difficulty trails.',
    bioCs:
      'Giulia se soustredi na trasy v Dolomitech a severni Italii pro turisty, kteri chteji dobre zorganizovanou logistiku a stezky stredni az vyssi obtiznosti.',
    rating: 4.9,
    languagesEn: ['Italian', 'English'],
    languagesCs: ['Italstina', 'Anglictina'],
    offersChat: true,
    offersTrips: true,
    tripPriceFrom: 510,
    whatsappLink:
      'https://wa.me/393330000001?text=Hi%20Giulia%2C%20please%20share%20your%20available%20mountain%20trips',
    instagramLink: 'https://www.instagram.com/',
  },
];

const TRIP_SEED = [
  {
    slug: 'andalusia-family-adventure-week',
    specialistSlug: 'lucia-moreno',
    countrySlug: 'spain',
    titleEn: 'Andalusia Family Adventure Week',
    titleCs: 'Rodinny dobrodruzny tyden v Andalusii',
    durationDays: 7,
    price: 980,
    difficulty: 2,
    maxGroupSize: 8,
    descriptionEn:
      'A balanced route with short hikes, white villages, and beach downtime designed for families and first-time Spain visitors.',
    descriptionCs:
      'Vyvazena trasa s kratkymi turami, bilymi vesnicemi a odpocinkem na plazi navrzena pro rodiny a prvni navstevu Spanelska.',
    startDates: ['2026-04-18', '2026-05-23', '2026-09-12'],
  },
  {
    slug: 'atlantic-villages-and-cliffs-circuit',
    specialistSlug: 'joao-santos',
    countrySlug: 'portugal',
    titleEn: 'Atlantic Villages and Cliffs Circuit',
    titleCs: 'Okruh atlantickych vesnic a utesu',
    durationDays: 6,
    price: 860,
    difficulty: 2,
    maxGroupSize: 10,
    descriptionEn:
      'A coastal Portugal circuit with boardwalk hikes, fishing villages, and small-group community experiences.',
    descriptionCs:
      'Pobrezni okruh Portugalskem s turami po promenadach, rybarskymi vesnicemi a komunitnimi zazitky v malych skupinach.',
    startDates: ['2026-03-20', '2026-06-14', '2026-10-02'],
  },
  {
    slug: 'dolomites-basecamp-trek',
    specialistSlug: 'giulia-conti',
    countrySlug: 'italy',
    titleEn: 'Dolomites Basecamp Trek',
    titleCs: 'Trekova zakladna v Dolomitech',
    durationDays: 8,
    price: 1480,
    difficulty: 4,
    maxGroupSize: 6,
    descriptionEn:
      'A high-scenery alpine week with refuge lunches, ridge viewpoints, and progressive acclimatization days.',
    descriptionCs:
      'Vysoce scenicky alpsky tyden s obedy na horskych chatcich, hrebenovymi vyhledy a postupnou aklimatizaci.',
    startDates: ['2026-07-05', '2026-08-09', '2026-09-06'],
  },
];

const COUNTRY_COMBINATION_SEED = [
  {
    slug: 'iberian-atlantic-loop',
    countries: ['portugal', 'spain'],
    nameEn: 'Iberian Atlantic Loop',
    nameCs: 'Ibersky atlanticky okruh',
    descriptionEn:
      'A balanced route combining food cities, surf coasts, and medium-easy hikes across the Iberian Peninsula.',
    descriptionCs:
      'Vyvazena trasa kombinujici gastronomicka mesta, surferske pobrezi a stredne lehke tury napric Iberskym poloostrovem.',
    minDays: 10,
    optimalDays: 16,
    routeDescriptionEn:
      'Start in Porto, drive south through Lisbon and Algarve, cross into Andalusia, and finish in Madrid or Barcelona.',
    routeDescriptionCs:
      'Zacnete v Portu, pokracujte na jih pres Lisabon a Algarve, prejedte do Andalusie a zakoncete cestu v Madridu nebo Barcelone.',
  },
  {
    slug: 'mediterranean-to-alps-arc',
    countries: ['spain', 'france', 'italy'],
    nameEn: 'Mediterranean to Alps Arc',
    nameCs: 'Oblouk od Stredomori k Alpam',
    descriptionEn:
      'Move from warm Mediterranean coastlines into high alpine terrain for a high-contrast Europe itinerary.',
    descriptionCs:
      'Presunte se z tepleho stredomorskeho pobrezi do vysokohorskeho terenu pro kontrastni evropsky itinerar.',
    minDays: 12,
    optimalDays: 18,
    routeDescriptionEn:
      'Begin on the Spanish coast, continue through Southern France, then end with mountain trekking days in Northern Italy.',
    routeDescriptionCs:
      'Zacnete na spanelskem pobrezi, pokracujte pres jih Francie a zakoncte cestu horskymi treky na severu Italie.',
  },
];

function isTrue(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function getDatabaseConfig() {
  const connectionString = process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL;
  if (connectionString) {
    return {
      connectionString,
      ssl: isTrue(process.env.DB_SSL || process.env.DATABASE_SSL)
        ? { rejectUnauthorized: !isTrue(process.env.DB_SSL_REJECT_UNAUTHORIZED) }
        : undefined,
    };
  }

  return {
    host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.DATABASE_PORT || 5432),
    user: process.env.DB_USER || process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DATABASE_NAME || 'directus',
    ssl: isTrue(process.env.DB_SSL || process.env.DATABASE_SSL)
      ? { rejectUnauthorized: !isTrue(process.env.DB_SSL_REJECT_UNAUTHORIZED) }
      : undefined,
  };
}

async function ensureTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS countries (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      iso_code VARCHAR(3) NOT NULL,
      is_state BOOLEAN NOT NULL DEFAULT FALSE,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      parent_country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
      hero_image_url TEXT,
      hero_image_alt TEXT,
      name_en TEXT NOT NULL,
      name_cs TEXT NOT NULL,
      description_en TEXT,
      description_cs TEXT,
      hiking_level INTEGER,
      beach_level INTEGER,
      roadtrip_level INTEGER,
      min_days INTEGER,
      optimal_days INTEGER,
      avg_direct_flight_price NUMERIC(10, 2),
      avg_cheap_flight_price NUMERIC(10, 2),
      avg_accommodation_price NUMERIC(10, 2),
      avg_food_price_per_day NUMERIC(10, 2),
      pregnancy_safe BOOLEAN,
      infant_safe BOOLEAN,
      geo_json JSONB
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS country_best_combinations (
      id SERIAL PRIMARY KEY,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      related_country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE(country_id, related_country_id)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS wonders (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      hero_image_url TEXT,
      hero_image_alt TEXT,
      name_en TEXT NOT NULL,
      name_cs TEXT NOT NULL,
      short_description_en TEXT,
      short_description_cs TEXT,
      full_description_en TEXT,
      full_description_cs TEXT,
      location_lat NUMERIC(9, 6),
      location_lng NUMERIC(9, 6),
      hiking_difficulty INTEGER,
      altitude_meters INTEGER,
      pregnancy_safe BOOLEAN,
      infant_safe BOOLEAN
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS wonder_tags (
      id SERIAL PRIMARY KEY,
      wonder_id INTEGER NOT NULL REFERENCES wonders(id) ON DELETE CASCADE,
      label_en TEXT NOT NULL,
      label_cs TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS hikes (
      id SERIAL PRIMARY KEY,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      wonder_id INTEGER REFERENCES wonders(id) ON DELETE SET NULL,
      name_en TEXT NOT NULL,
      name_cs TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      elevation_gain INTEGER,
      distance_km NUMERIC(10, 2),
      duration_hours NUMERIC(10, 2),
      best_season_en TEXT,
      best_season_cs TEXT,
      description_en TEXT,
      description_cs TEXT
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS attractions (
      id SERIAL PRIMARY KEY,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('beach', 'viewpoint', 'town', 'waterfall')),
      name_en TEXT NOT NULL,
      name_cs TEXT NOT NULL,
      description_en TEXT,
      description_cs TEXT
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS specialists (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
      profile_image_url TEXT,
      profile_image_alt TEXT,
      name_en TEXT NOT NULL,
      name_cs TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('local_advisor', 'community_leader')),
      bio_en TEXT,
      bio_cs TEXT,
      rating NUMERIC(3, 2),
      languages_en TEXT[] NOT NULL DEFAULT '{}',
      languages_cs TEXT[] NOT NULL DEFAULT '{}',
      offers_chat BOOLEAN NOT NULL DEFAULT TRUE,
      offers_trips BOOLEAN NOT NULL DEFAULT TRUE,
      trip_price_from NUMERIC(10, 2),
      whatsapp_link TEXT,
      instagram_link TEXT,
      enabled BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS specialist_featured_countries (
      id SERIAL PRIMARY KEY,
      specialist_id INTEGER NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE(specialist_id, country_id)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      specialist_id INTEGER NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      title_en TEXT NOT NULL,
      title_cs TEXT NOT NULL,
      duration_days INTEGER,
      price NUMERIC(10, 2),
      difficulty INTEGER,
      max_group_size INTEGER,
      description_en TEXT,
      description_cs TEXT
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trip_start_dates (
      id SERIAL PRIMARY KEY,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      UNIQUE(trip_id, start_date)
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS country_combinations (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL,
      name_cs TEXT NOT NULL,
      description_en TEXT,
      description_cs TEXT,
      min_days INTEGER,
      optimal_days INTEGER,
      route_description_en TEXT,
      route_description_cs TEXT
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS country_combination_countries (
      id SERIAL PRIMARY KEY,
      combination_id INTEGER NOT NULL REFERENCES country_combinations(id) ON DELETE CASCADE,
      country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE(combination_id, country_id)
    )
  `);
}

async function truncateDomainTables(client) {
  await client.query(`
    TRUNCATE TABLE
      trip_start_dates,
      trips,
      specialist_featured_countries,
      specialists,
      attractions,
      hikes,
      wonder_tags,
      wonders,
      country_combination_countries,
      country_combinations,
      country_best_combinations,
      countries
    RESTART IDENTITY CASCADE
  `);
}

async function seedCountries(client) {
  const countryIds = new Map();

  for (const country of COUNTRY_SEED) {
    const image = IMAGE_SOURCES[country.image];
    const result = await client.query(
      `
        INSERT INTO countries (
          slug,
          iso_code,
          is_state,
          enabled,
          parent_country_id,
          hero_image_url,
          hero_image_alt,
          name_en,
          name_cs,
          description_en,
          description_cs,
          hiking_level,
          beach_level,
          roadtrip_level,
          min_days,
          optimal_days,
          avg_direct_flight_price,
          avg_cheap_flight_price,
          avg_accommodation_price,
          avg_food_price_per_day,
          pregnancy_safe,
          infant_safe
        )
        VALUES (
          $1,$2,FALSE,TRUE,NULL,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
        )
        RETURNING id
      `,
      [
        country.slug,
        country.isoCode,
        image?.url ?? null,
        image?.alt ?? null,
        country.nameEn,
        country.nameCs,
        country.descriptionEn,
        country.descriptionCs,
        country.hikingLevel,
        country.beachLevel,
        country.roadtripLevel,
        country.minDays,
        country.optimalDays,
        country.avgDirectFlightPrice,
        country.avgCheapFlightPrice,
        country.avgAccommodationPrice,
        country.avgFoodPricePerDay,
        country.pregnancySafe,
        country.infantSafe,
      ],
    );
    countryIds.set(country.slug, result.rows[0].id);
  }

  for (const region of REGION_SEED) {
    const image = IMAGE_SOURCES[region.image];
    const parentId = countryIds.get(region.parentSlug);
    const result = await client.query(
      `
        INSERT INTO countries (
          slug,
          iso_code,
          is_state,
          enabled,
          parent_country_id,
          hero_image_url,
          hero_image_alt,
          name_en,
          name_cs,
          description_en,
          description_cs,
          hiking_level,
          beach_level,
          roadtrip_level,
          min_days,
          optimal_days,
          avg_direct_flight_price,
          avg_cheap_flight_price,
          avg_accommodation_price,
          avg_food_price_per_day,
          pregnancy_safe,
          infant_safe
        )
        VALUES (
          $1,$2,TRUE,TRUE,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
        )
        RETURNING id
      `,
      [
        region.slug,
        region.isoCode,
        parentId ?? null,
        image?.url ?? null,
        image?.alt ?? null,
        region.nameEn,
        region.nameCs,
        region.descriptionEn,
        region.descriptionCs,
        region.hikingLevel,
        region.beachLevel,
        region.roadtripLevel,
        region.minDays,
        region.optimalDays,
        region.avgDirectFlightPrice,
        region.avgCheapFlightPrice,
        region.avgAccommodationPrice,
        region.avgFoodPricePerDay,
        region.pregnancySafe,
        region.infantSafe,
      ],
    );
    countryIds.set(region.slug, result.rows[0].id);
  }

  for (const [slug, relatedSlugs] of Object.entries(BEST_COMBINATIONS)) {
    const countryId = countryIds.get(slug);
    if (!countryId) continue;

    for (let index = 0; index < relatedSlugs.length; index += 1) {
      const relatedCountryId = countryIds.get(relatedSlugs[index]);
      if (!relatedCountryId) continue;
      await client.query(
        `
          INSERT INTO country_best_combinations (country_id, related_country_id, sort_order)
          VALUES ($1, $2, $3)
        `,
        [countryId, relatedCountryId, index],
      );
    }
  }

  return countryIds;
}

async function seedWonders(client, countryIds) {
  const wonderIds = new Map();

  for (const wonder of WONDER_SEED) {
    const image = IMAGE_SOURCES[wonder.image];
    const countryId = countryIds.get(wonder.countrySlug);
    if (!countryId) continue;

    const result = await client.query(
      `
        INSERT INTO wonders (
          slug,
          country_id,
          hero_image_url,
          hero_image_alt,
          name_en,
          name_cs,
          short_description_en,
          short_description_cs,
          full_description_en,
          full_description_cs,
          location_lat,
          location_lng,
          hiking_difficulty,
          altitude_meters,
          pregnancy_safe,
          infant_safe
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
        RETURNING id
      `,
      [
        wonder.slug,
        countryId,
        image?.url ?? null,
        image?.alt ?? null,
        wonder.nameEn,
        wonder.nameCs,
        wonder.shortDescriptionEn,
        wonder.shortDescriptionCs,
        wonder.fullDescriptionEn,
        wonder.fullDescriptionCs,
        wonder.locationLat,
        wonder.locationLng,
        wonder.hikingDifficulty,
        wonder.altitudeMeters,
        wonder.pregnancySafe,
        wonder.infantSafe,
      ],
    );

    const wonderId = result.rows[0].id;
    wonderIds.set(wonder.slug, wonderId);

    for (let index = 0; index < wonder.tagsEn.length; index += 1) {
      await client.query(
        `
          INSERT INTO wonder_tags (wonder_id, label_en, label_cs, sort_order)
          VALUES ($1, $2, $3, $4)
        `,
        [wonderId, wonder.tagsEn[index], wonder.tagsCs[index] ?? wonder.tagsEn[index], index],
      );
    }
  }

  return wonderIds;
}

async function seedHikes(client, countryIds, wonderIds) {
  for (const hike of HIKE_SEED) {
    const countryId = countryIds.get(hike.countrySlug);
    if (!countryId) continue;
    const wonderId = hike.wonderSlug ? wonderIds.get(hike.wonderSlug) : null;

    await client.query(
      `
        INSERT INTO hikes (
          country_id,
          wonder_id,
          name_en,
          name_cs,
          difficulty,
          elevation_gain,
          distance_km,
          duration_hours,
          best_season_en,
          best_season_cs,
          description_en,
          description_cs
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
      [
        countryId,
        wonderId ?? null,
        hike.nameEn,
        hike.nameCs,
        hike.difficulty,
        hike.elevationGain,
        hike.distanceKm,
        hike.durationHours,
        hike.bestSeasonEn,
        hike.bestSeasonCs,
        hike.descriptionEn,
        hike.descriptionCs,
      ],
    );
  }
}

async function seedAttractions(client, countryIds) {
  for (const attraction of ATTRACTION_SEED) {
    const countryId = countryIds.get(attraction.countrySlug);
    if (!countryId) continue;
    await client.query(
      `
        INSERT INTO attractions (
          country_id,
          type,
          name_en,
          name_cs,
          description_en,
          description_cs
        )
        VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        countryId,
        attraction.type,
        attraction.nameEn,
        attraction.nameCs,
        attraction.descriptionEn,
        attraction.descriptionCs,
      ],
    );
  }
}

async function seedSpecialists(client, countryIds) {
  const specialistIds = new Map();

  for (const specialist of SPECIALIST_SEED) {
    const image = IMAGE_SOURCES[specialist.image];
    const countryId = countryIds.get(specialist.countrySlug);

    const result = await client.query(
      `
        INSERT INTO specialists (
          slug,
          country_id,
          profile_image_url,
          profile_image_alt,
          name_en,
          name_cs,
          type,
          bio_en,
          bio_cs,
          rating,
          languages_en,
          languages_cs,
          offers_chat,
          offers_trips,
          trip_price_from,
          whatsapp_link,
          instagram_link,
          enabled
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE)
        RETURNING id
      `,
      [
        specialist.slug,
        countryId ?? null,
        image?.url ?? null,
        image?.alt ?? null,
        specialist.nameEn,
        specialist.nameCs,
        specialist.type,
        specialist.bioEn,
        specialist.bioCs,
        specialist.rating,
        specialist.languagesEn,
        specialist.languagesCs,
        specialist.offersChat,
        specialist.offersTrips,
        specialist.tripPriceFrom,
        specialist.whatsappLink,
        specialist.instagramLink,
      ],
    );
    const specialistId = result.rows[0].id;
    specialistIds.set(specialist.slug, specialistId);

    for (let index = 0; index < specialist.featuredInCountries.length; index += 1) {
      const countrySlug = specialist.featuredInCountries[index];
      const featuredCountryId = countryIds.get(countrySlug);
      if (!featuredCountryId) continue;
      await client.query(
        `
          INSERT INTO specialist_featured_countries (specialist_id, country_id, sort_order)
          VALUES ($1, $2, $3)
        `,
        [specialistId, featuredCountryId, index],
      );
    }
  }

  return specialistIds;
}

async function seedTrips(client, specialistIds, countryIds) {
  for (const trip of TRIP_SEED) {
    const specialistId = specialistIds.get(trip.specialistSlug);
    const countryId = countryIds.get(trip.countrySlug);
    if (!specialistId || !countryId) continue;

    const result = await client.query(
      `
        INSERT INTO trips (
          slug,
          specialist_id,
          country_id,
          title_en,
          title_cs,
          duration_days,
          price,
          difficulty,
          max_group_size,
          description_en,
          description_cs
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING id
      `,
      [
        trip.slug,
        specialistId,
        countryId,
        trip.titleEn,
        trip.titleCs,
        trip.durationDays,
        trip.price,
        trip.difficulty,
        trip.maxGroupSize,
        trip.descriptionEn,
        trip.descriptionCs,
      ],
    );
    const tripId = result.rows[0].id;

    for (const date of trip.startDates) {
      await client.query(
        `INSERT INTO trip_start_dates (trip_id, start_date) VALUES ($1, $2)`,
        [tripId, date],
      );
    }
  }
}

async function seedCountryCombinations(client, countryIds) {
  for (const combination of COUNTRY_COMBINATION_SEED) {
    const result = await client.query(
      `
        INSERT INTO country_combinations (
          slug,
          name_en,
          name_cs,
          description_en,
          description_cs,
          min_days,
          optimal_days,
          route_description_en,
          route_description_cs
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id
      `,
      [
        combination.slug,
        combination.nameEn,
        combination.nameCs,
        combination.descriptionEn,
        combination.descriptionCs,
        combination.minDays,
        combination.optimalDays,
        combination.routeDescriptionEn,
        combination.routeDescriptionCs,
      ],
    );
    const combinationId = result.rows[0].id;

    for (let index = 0; index < combination.countries.length; index += 1) {
      const countryId = countryIds.get(combination.countries[index]);
      if (!countryId) continue;
      await client.query(
        `
          INSERT INTO country_combination_countries (combination_id, country_id, sort_order)
          VALUES ($1, $2, $3)
        `,
        [combinationId, countryId, index],
      );
    }
  }
}

export async function runResetAndSeed() {
  const client = new Client(getDatabaseConfig());
  await client.connect();

  try {
    await client.query('BEGIN');
    await ensureTables(client);
    await truncateDomainTables(client);

    const countryIds = await seedCountries(client);
    const wonderIds = await seedWonders(client, countryIds);
    await seedHikes(client, countryIds, wonderIds);
    await seedAttractions(client, countryIds);
    const specialistIds = await seedSpecialists(client, countryIds);
    await seedTrips(client, specialistIds, countryIds);
    await seedCountryCombinations(client, countryIds);

    await client.query('COMMIT');
    console.info('[seed] Database reset and initial data seed completed');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runResetAndSeed().catch((error) => {
    console.error('[seed] Failed to reset and seed database', error);
    process.exit(1);
  });
}
