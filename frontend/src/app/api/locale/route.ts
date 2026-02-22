import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/locale";

interface LocaleRequestBody {
  locale?: string;
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  let requestedLocale: string | undefined;

  try {
    const payload = (await request.json()) as LocaleRequestBody;
    requestedLocale = payload.locale;
  } catch {
    requestedLocale = undefined;
  }

  const locale = resolveLocale(requestedLocale);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: ONE_YEAR_IN_SECONDS,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ locale }, { status: 200 });
}
