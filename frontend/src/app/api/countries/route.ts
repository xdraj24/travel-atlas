import { NextRequest, NextResponse } from "next/server";

import { fetchCountries } from "@/lib/api";
import { parseCountryFilters, type SearchParams } from "@/lib/filters";
import { LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/locale";

export async function GET(request: NextRequest) {
  const params: SearchParams = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const filters = parseCountryFilters(params);
    const locale = resolveLocale(
      request.nextUrl.searchParams.get("locale") ??
        request.nextUrl.searchParams.get("lang") ??
        request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    );
    const countries = await fetchCountries(filters, locale);

    return NextResponse.json(
      {
        data: countries,
        filters,
        total: countries.length,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load countries from backend API.",
      },
      { status: 500 },
    );
  }
}
