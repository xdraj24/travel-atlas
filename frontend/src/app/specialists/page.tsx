import Link from "next/link";

import { SpecialistCard } from "@/components/specialist/SpecialistCard";
import { fetchSpecialists } from "@/lib/api";
import { getDictionary } from "@/lib/dictionary";
import { type SearchParams } from "@/lib/filters";
import { getRequestLocale } from "@/lib/locale.server";

interface SpecialistsPageProps {
  searchParams: Promise<SearchParams>;
}

type SpecialistTab = "local_advisor" | "community_leader";

function resolveTab(value: string | undefined): SpecialistTab {
  if (value === "community_leader") return "community_leader";
  return "local_advisor";
}

export default async function SpecialistsPage({
  searchParams,
}: SpecialistsPageProps) {
  const params = await searchParams;
  const tab = resolveTab(typeof params.tab === "string" ? params.tab : undefined);
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  const specialists = await fetchSpecialists({ type: tab, locale });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-6 pt-20 text-[var(--text-primary)] md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tighter text-[#F0F2F0]">
            {dictionary.specialistsPage.title}
          </h1>
          <p className="text-sm text-[#B3BDB7]">
            {dictionary.specialistsPage.subtitle}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/specialists?tab=local_advisor"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === "local_advisor"
                ? "bg-[var(--brand-primary)] text-white"
                : "border border-white/12 bg-white/5 text-[#C2CBC6] hover:bg-white/10"
            }`}
          >
            {dictionary.specialistsPage.localAdvisorsTab}
          </Link>
          <Link
            href="/specialists?tab=community_leader"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === "community_leader"
                ? "bg-[var(--brand-primary)] text-white"
                : "border border-white/12 bg-white/5 text-[#C2CBC6] hover:bg-white/10"
            }`}
          >
            {dictionary.specialistsPage.communityLeadersTab}
          </Link>
        </div>

        {specialists.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} locale={locale} />
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-white/12 bg-white/5 p-6 text-sm text-[#B3BDB7] backdrop-blur-[20px]">
            {dictionary.specialistsPage.noSpecialists}
          </section>
        )}
      </div>
    </main>
  );
}
