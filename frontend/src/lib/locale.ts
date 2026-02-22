export const SUPPORTED_LOCALES = ["cs", "en"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "cs";
export const LOCALE_COOKIE_NAME = "atlas-locale";

const localeLabels: Record<AppLocale, string> = {
  cs: "Czech",
  en: "English",
};

export function resolveLocale(value: string | null | undefined): AppLocale {
  if (value === "cs" || value === "en") {
    return value;
  }
  return DEFAULT_LOCALE;
}

export function getLocaleLabel(locale: AppLocale): string {
  return localeLabels[locale];
}
