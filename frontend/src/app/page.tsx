import { WorldMap } from "@/components/map/WorldMap";
import { fetchCountries } from "@/lib/api";

export default async function Home() {
  const countries = await fetchCountries();

  return (
    <main className="min-h-screen bg-[#121614] text-[#F0F2F0]">
      <WorldMap countries={countries} />
    </main>
  );
}
