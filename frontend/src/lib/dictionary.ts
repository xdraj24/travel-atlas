import { type AppLocale } from "@/lib/locale";

interface LocaleDictionary {
  nav: {
    map: string;
    countries: string;
    specialists: string;
    journal: string;
  };
  footer: {
    language: string;
    brandName: string;
  };
  home: {
    journalLabel: string;
    journalTitle: string;
    journalDescription: string;
  };
  worldMap: {
    regionCountry: string;
    regionRegional: string;
    mapMissingToken: string;
    hikingLabel: string;
    roadtripLabel: string;
    mapTab: string;
    listTab: string;
    hoverInstruction: string;
    zoomInAria: string;
    zoomOutAria: string;
    closeCountryPreviewAria: string;
  };
  countryPreview: {
    pregnancyLabel: string;
    infantLabel: string;
    safeSuffix: string;
    previewMountainRoad: string;
    previewHiking: string;
    previewRoadtrip: string;
    previewBalanced: string;
    flexibleDays: string;
    wonderEasy: string;
    wonderModerate: string;
    wonderAdvanced: string;
    regionCountry: string;
    regionRegional: string;
    hikingLabel: string;
    roadtripLabel: string;
    beachesLabel: string;
    minDaysLabel: string;
    optimalLabel: string;
    budgetLabel: string;
    pregnancyNote: string;
    infantNote: string;
    mustSeeWonders: string;
    noWonders: string;
    explorePrefix: string;
    planTrip: string;
    specialist: string;
  };
  countryHero: {
    noHeroImage: string;
    adventureCard: string;
    minimalVsOptimal: string;
    daysLabel: string;
    hiking: string;
    beach: string;
    roadtrip: string;
  };
  countryStats: {
    avgDirectFlight: string;
    avgCheapFlight: string;
    accommodationPerNight: string;
    foodPerDay: string;
  };
  countryPage: {
    backToPrefix: string;
    wondersHeading: string;
    noWonders: string;
    hikesHeading: string;
    hikeDifficulty: string;
    hoursShort: string;
    noHikes: string;
    specialistsHeading: string;
    noSpecialists: string;
    bestCombinedWithHeading: string;
    noCombinations: string;
    safetyIndicatorsHeading: string;
    pregnancyLabel: string;
    infantLabel: string;
    regionsHeading: string;
    regionExploreDetails: string;
  };
  specialistsPage: {
    title: string;
    subtitle: string;
    localAdvisorsTab: string;
    communityLeadersTab: string;
    noSpecialists: string;
  };
  specialistCard: {
    typeLocalAdvisor: string;
    typeCommunityLeader: string;
    languagesLabel: string;
    defaultLanguage: string;
    tripsFrom: string;
    chat: string;
    viewTrips: string;
  };
  specialistDetail: {
    profileLabel: string;
    typeLocalAdvisor: string;
    typeCommunityLeader: string;
    ratingLabel: string;
    languagesLabel: string;
    defaultLanguage: string;
    basedInPrefix: string;
    requestToJoin: string;
    externalLinksHeading: string;
    chatOnWhatsapp: string;
    tripsHeading: string;
    daysLabel: string;
    difficultyLabel: string;
    bookExternally: string;
    noTrips: string;
  };
  wonderCard: {
    fallbackDescription: string;
  };
  wonderPage: {
    pregnancyLabel: string;
    infantLabel: string;
    locationStatsHeading: string;
    altitudeLabel: string;
    difficultyLabel: string;
    coordinatesLabel: string;
    linkedHikesHeading: string;
    hikeDifficulty: string;
    noLinkedHikes: string;
    linkedCountriesHeading: string;
    noLinkedCountries: string;
  };
  wonderMarkerMap: {
    missingToken: string;
  };
  combinationPage: {
    badge: string;
    minDaysLabel: string;
    optimalDaysLabel: string;
    countriesHeading: string;
    noCountries: string;
    routeDescriptionHeading: string;
  };
  common: {
    safe: string;
    caution: string;
    notAvailable: string;
    unknown: string;
  };
}

const dictionaries: Record<AppLocale, LocaleDictionary> = {
  en: {
    nav: {
      map: "Map",
      countries: "Countries",
      specialists: "Specialists",
      journal: "Journal",
    },
    footer: {
      language: "Language",
      brandName: "Curated Adventure Atlas",
    },
    home: {
      journalLabel: "Journal",
      journalTitle: "Curated dispatches from route-tested adventures",
      journalDescription:
        "Field notes and itinerary essays are being curated now. Use the map or country list to discover destinations while the journal collection grows.",
    },
    worldMap: {
      regionCountry: "Country Escape",
      regionRegional: "Regional Escape",
      mapMissingToken: "Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to enable the interactive map.",
      hikingLabel: "Hiking",
      roadtripLabel: "Roadtrip",
      mapTab: "Map",
      listTab: "List",
      hoverInstruction: "Hover to preview, click to open destination details",
      zoomInAria: "Zoom in",
      zoomOutAria: "Zoom out",
      closeCountryPreviewAria: "Close country preview",
    },
    countryPreview: {
      pregnancyLabel: "Pregnancy",
      infantLabel: "Infant",
      safeSuffix: "Safe",
      previewMountainRoad: "Big mountain energy with cinematic roads and high-impact views.",
      previewHiking: "Built for active days on ridgelines, forests, and alpine trails.",
      previewRoadtrip: "A route-first destination with dramatic drives and hidden stops.",
      previewBalanced: "A curated destination pick with balanced nature and comfort.",
      flexibleDays: "Flexible",
      wonderEasy: "Easy",
      wonderModerate: "Moderate",
      wonderAdvanced: "Advanced",
      regionCountry: "Country Escape",
      regionRegional: "Regional Escape",
      hikingLabel: "Hiking",
      roadtripLabel: "Roadtrip",
      beachesLabel: "Beaches",
      minDaysLabel: "Min Days",
      optimalLabel: "Optimal",
      budgetLabel: "Budget",
      pregnancyNote: "Low-altitude routes and high-access care zones available.",
      infantNote: "Avoid routes above 2500m for smoother acclimatization.",
      mustSeeWonders: "Must See Wonders",
      noWonders: "Click around to discover destinations with curated wonders and route-ready picks.",
      explorePrefix: "Explore",
      planTrip: "Plan Trip",
      specialist: "Specialist",
    },
    countryHero: {
      noHeroImage: "No hero image uploaded",
      adventureCard: "Adventure Card",
      minimalVsOptimal: "Minimal vs Optimal Stay",
      daysLabel: "days",
      hiking: "Hiking",
      beach: "Beach",
      roadtrip: "Roadtrip",
    },
    countryStats: {
      avgDirectFlight: "Avg direct flight",
      avgCheapFlight: "Avg cheap flight",
      accommodationPerNight: "Accommodation / night",
      foodPerDay: "Food / day",
    },
    countryPage: {
      backToPrefix: "Back to",
      wondersHeading: "Wonders",
      noWonders: "No wonders published yet.",
      hikesHeading: "Hikes",
      hikeDifficulty: "Difficulty",
      hoursShort: "hrs",
      noHikes: "No hikes published yet.",
      specialistsHeading: "Travel Specialists",
      noSpecialists: "No specialists linked for this destination.",
      bestCombinedWithHeading: "Best Combined With",
      noCombinations: "Combination links will appear when curated.",
      safetyIndicatorsHeading: "Safety Indicators",
      pregnancyLabel: "Pregnancy",
      infantLabel: "Infant",
      regionsHeading: "Regions",
      regionExploreDetails: "Explore regional itinerary details.",
    },
    specialistsPage: {
      title: "Travel Specialists",
      subtitle: "Connect with local advisors and community trip leaders.",
      localAdvisorsTab: "Local Advisors",
      communityLeadersTab: "Community Trip Leaders",
      noSpecialists: "No specialists found for this tab.",
    },
    specialistCard: {
      typeLocalAdvisor: "Local Advisor",
      typeCommunityLeader: "Community Trip Leader",
      languagesLabel: "Languages",
      defaultLanguage: "English",
      tripsFrom: "Trips from",
      chat: "Chat",
      viewTrips: "View Trips",
    },
    specialistDetail: {
      profileLabel: "Specialist Profile",
      typeLocalAdvisor: "Local Advisor",
      typeCommunityLeader: "Community Trip Leader",
      ratingLabel: "Rating",
      languagesLabel: "Languages",
      defaultLanguage: "English",
      basedInPrefix: "Based in",
      requestToJoin: "Request to Join",
      externalLinksHeading: "External Booking Links",
      chatOnWhatsapp: "Chat on WhatsApp",
      tripsHeading: "Trips",
      daysLabel: "days",
      difficultyLabel: "Difficulty",
      bookExternally: "Book Externally",
      noTrips: "No published trips yet.",
    },
    wonderCard: {
      fallbackDescription: "Curated world wonder destination.",
    },
    wonderPage: {
      pregnancyLabel: "Pregnancy",
      infantLabel: "Infant",
      locationStatsHeading: "Location & Stats",
      altitudeLabel: "Altitude",
      difficultyLabel: "Difficulty",
      coordinatesLabel: "Coordinates",
      linkedHikesHeading: "Linked Hikes",
      hikeDifficulty: "Difficulty",
      noLinkedHikes: "No linked hikes available for this wonder.",
      linkedCountriesHeading: "Linked Countries",
      noLinkedCountries: "No countries linked yet.",
    },
    wonderMarkerMap: {
      missingToken: "Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to render this map preview.",
    },
    combinationPage: {
      badge: "Country Combination",
      minDaysLabel: "Min days",
      optimalDaysLabel: "Optimal days",
      countriesHeading: "Countries",
      noCountries: "No countries linked yet.",
      routeDescriptionHeading: "Route Description",
    },
    common: {
      safe: "Safe",
      caution: "Caution",
      notAvailable: "N/A",
      unknown: "?",
    },
  },
  cs: {
    nav: {
      map: "Mapa",
      countries: "Zeme",
      specialists: "Specialiste",
      journal: "Denik",
    },
    footer: {
      language: "Jazyk",
      brandName: "Kuratorsky atlas dobrodruzstvi",
    },
    home: {
      journalLabel: "Denik",
      journalTitle: "Vybrane reportaze z overenych dobrodruzstvi",
      journalDescription:
        "Poznamky z cest a itinerare prubezne doplnujeme. Mezitim objevujte destinace pres mapu nebo seznam zemi.",
    },
    worldMap: {
      regionCountry: "Zeme",
      regionRegional: "Regionalni destinace",
      mapMissingToken: "Pridejte NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN pro interaktivni mapu.",
      hikingLabel: "Turistika",
      roadtripLabel: "Roadtrip",
      mapTab: "Mapa",
      listTab: "Seznam",
      hoverInstruction: "Najedte mysi pro nahled, kliknutim otevrete detail destinace",
      zoomInAria: "Priblizit",
      zoomOutAria: "Oddalit",
      closeCountryPreviewAria: "Zavrit nahled zeme",
    },
    countryPreview: {
      pregnancyLabel: "Tehotenstvi",
      infantLabel: "Miminko",
      safeSuffix: "bezpecne",
      previewMountainRoad: "Silna horska energie, filmove silnice a vyrazne vyhledy.",
      previewHiking: "Idealni pro aktivni dny na hrebenech, v lesich a na alpskych stezkach.",
      previewRoadtrip: "Destinace stavena pro roadtrip s dramatickymi presuny a skrytymi zastavkami.",
      previewBalanced: "Vyvazeny vyber destinace s prirodou i pohodlim.",
      flexibleDays: "Flexibilni",
      wonderEasy: "Lehke",
      wonderModerate: "Stredni",
      wonderAdvanced: "Narocne",
      regionCountry: "Zeme",
      regionRegional: "Regionalni destinace",
      hikingLabel: "Turistika",
      roadtripLabel: "Roadtrip",
      beachesLabel: "Plaze",
      minDaysLabel: "Min. dni",
      optimalLabel: "Optimal",
      budgetLabel: "Rozpocet",
      pregnancyNote: "K dispozici jsou nizko polozene trasy a mista s dobrou dostupnosti pece.",
      infantNote: "Pro snazsi aklimatizaci se vyhybejte trasam nad 2500 m.",
      mustSeeWonders: "Mista, ktera stoji za to",
      noWonders:
        "Klikanim objevujte destinace s vybranymi zajimavostmi a pripravene trasami.",
      explorePrefix: "Objevit",
      planTrip: "Naplanovat cestu",
      specialist: "Specialista",
    },
    countryHero: {
      noHeroImage: "Hlavni obrazek neni nahrany",
      adventureCard: "Karta dobrodruzstvi",
      minimalVsOptimal: "Minimalni vs optimalni delka pobytu",
      daysLabel: "dni",
      hiking: "Turistika",
      beach: "Plaz",
      roadtrip: "Roadtrip",
    },
    countryStats: {
      avgDirectFlight: "Prumerna cena primych letu",
      avgCheapFlight: "Prumerna cena levnych letu",
      accommodationPerNight: "Ubytovani / noc",
      foodPerDay: "Jidlo / den",
    },
    countryPage: {
      backToPrefix: "Zpet na",
      wondersHeading: "Zajimavosti",
      noWonders: "Zadne zajimavosti zatim nejsou publikovane.",
      hikesHeading: "Tury",
      hikeDifficulty: "Obtiznost",
      hoursShort: "hod",
      noHikes: "Zadne tury zatim nejsou publikovane.",
      specialistsHeading: "Cestovni specialiste",
      noSpecialists: "Pro tuto destinaci nejsou prirazeni specialiste.",
      bestCombinedWithHeading: "Nejlepe kombinovat s",
      noCombinations: "Doporucene kombinace se zobrazi po kuratorskem vyberu.",
      safetyIndicatorsHeading: "Bezpecnostni indikatory",
      pregnancyLabel: "Tehotenstvi",
      infantLabel: "Miminko",
      regionsHeading: "Regiony",
      regionExploreDetails: "Prohlednout detail regionalniho itinerare.",
    },
    specialistsPage: {
      title: "Cestovni specialiste",
      subtitle: "Spojte se s mistnimi poradci a lidry komunitnich vyprav.",
      localAdvisorsTab: "Mistani poradci",
      communityLeadersTab: "Lidri komunitnich vyprav",
      noSpecialists: "Pro tuto zalozku nebyli nalezeni zadni specialiste.",
    },
    specialistCard: {
      typeLocalAdvisor: "Mistani poradce",
      typeCommunityLeader: "Lidr komunitni vypravy",
      languagesLabel: "Jazyky",
      defaultLanguage: "Anglictina",
      tripsFrom: "Vypravy od",
      chat: "Chat",
      viewTrips: "Zobrazit vypravy",
    },
    specialistDetail: {
      profileLabel: "Profil specialisty",
      typeLocalAdvisor: "Mistani poradce",
      typeCommunityLeader: "Lidr komunitni vypravy",
      ratingLabel: "Hodnoceni",
      languagesLabel: "Jazyky",
      defaultLanguage: "Anglictina",
      basedInPrefix: "Pusobi v",
      requestToJoin: "Pozadat o pridani",
      externalLinksHeading: "Externe rezervacni odkazy",
      chatOnWhatsapp: "Chat na WhatsAppu",
      tripsHeading: "Vypravy",
      daysLabel: "dni",
      difficultyLabel: "Obtiznost",
      bookExternally: "Rezervovat externe",
      noTrips: "Zadne publikovane vypravy zatim nejsou.",
    },
    wonderCard: {
      fallbackDescription: "Kuratorsky vybrana svetova zajimavost.",
    },
    wonderPage: {
      pregnancyLabel: "Tehotenstvi",
      infantLabel: "Miminko",
      locationStatsHeading: "Poloha a statistiky",
      altitudeLabel: "Nadmorska vyska",
      difficultyLabel: "Obtiznost",
      coordinatesLabel: "Souradnice",
      linkedHikesHeading: "Navazane tury",
      hikeDifficulty: "Obtiznost",
      noLinkedHikes: "Pro tuto zajimavost nejsou dostupne zadne navazane tury.",
      linkedCountriesHeading: "Navazane zeme",
      noLinkedCountries: "Zadne navazane zeme zatim nejsou.",
    },
    wonderMarkerMap: {
      missingToken: "Pridejte NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN pro zobrazeni nahledu mapy.",
    },
    combinationPage: {
      badge: "Kombinace zemi",
      minDaysLabel: "Min. dni",
      optimalDaysLabel: "Optimalni dni",
      countriesHeading: "Zeme",
      noCountries: "Zadne navazane zeme zatim nejsou.",
      routeDescriptionHeading: "Popis trasy",
    },
    common: {
      safe: "Bezpecne",
      caution: "Pozor",
      notAvailable: "N/A",
      unknown: "?",
    },
  },
};

export function getDictionary(locale: AppLocale): LocaleDictionary {
  return dictionaries[locale];
}
