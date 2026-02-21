import { NextRequest, NextResponse } from "next/server";

import { fetchCountries } from "@/lib/api";
import { parseCountryFilters, type SearchParams } from "@/lib/filters";

export async function GET(request: NextRequest) {
  const params: SearchParams = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const filters = parseCountryFilters(params);
    const countries = await fetchCountries(filters);

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
            : "Failed to load countries from Strapi.",
      },
      { status: 500 },
    );
  }
}
