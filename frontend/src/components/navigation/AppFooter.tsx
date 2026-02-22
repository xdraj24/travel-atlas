import { FooterLanguageSwitcher } from "@/components/navigation/FooterLanguageSwitcher";
import { type AppLocale } from "@/lib/locale";

interface AppFooterProps {
  locale: AppLocale;
}

export function AppFooter({ locale }: AppFooterProps) {
  return (
    <footer className="border-t border-white/8 bg-[#0f1311]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="text-xs text-[#9BA7A0]">Curated Adventure Atlas</p>
        <FooterLanguageSwitcher locale={locale} />
      </div>
    </footer>
  );
}
