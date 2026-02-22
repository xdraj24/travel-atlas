"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { getDictionary } from "@/lib/dictionary";
import {
  SUPPORTED_LOCALES,
  getLocaleLabel,
  type AppLocale,
} from "@/lib/locale";

interface FooterLanguageSwitcherProps {
  locale: AppLocale;
}

export function FooterLanguageSwitcher({ locale }: FooterLanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dictionary = getDictionary(locale);

  async function persistLocale(nextLocale: AppLocale): Promise<void> {
    await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locale: nextLocale }),
    });

    router.refresh();
  }

  const handleLanguageChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;

    startTransition(() => {
      void persistLocale(nextLocale);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#9BA7A0]">
        {dictionary.footer.language}
      </span>

      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
        {SUPPORTED_LOCALES.map((option) => {
          const isActive = option === locale;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleLanguageChange(option)}
              disabled={isPending}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-[#B8C2BC] hover:bg-white/10 hover:text-[#F0F2F0]"
              } ${isPending ? "opacity-70" : ""}`}
            >
              {getLocaleLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
