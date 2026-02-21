import Link from "next/link";

import { SpecialistCard } from "@/components/specialist/SpecialistCard";
import { fetchSpecialists } from "@/lib/api";
import { type SearchParams } from "@/lib/filters";

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

  const specialists = await fetchSpecialists({ type: tab });

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Travel Specialists</h1>
          <p className="text-sm text-stone-700">
            Connect with local advisors and community trip leaders.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/specialists?tab=local_advisor"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === "local_advisor"
                ? "bg-[#6f5d43] text-white"
                : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            Local Advisors
          </Link>
          <Link
            href="/specialists?tab=community_leader"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === "community_leader"
                ? "bg-[#6f5d43] text-white"
                : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            Community Trip Leaders
          </Link>
        </div>

        {specialists.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-stone-200 bg-white/80 p-6 text-sm text-stone-700">
            No specialists found for this tab.
          </section>
        )}
      </div>
    </main>
  );
}
