interface RatingPillProps {
  label: string;
  value?: number;
  accent?: "default" | "roadtrip";
}

export function RatingPill({ label, value, accent = "default" }: RatingPillProps) {
  const style =
    accent === "roadtrip"
      ? "border-[#D99E6B]/55 bg-[#D99E6B]/20 text-[#F3D3AE]"
      : "border-white/15 bg-white/5 text-[#CFE0D4]";

  return (
    <div className={`rounded-full border px-3 py-1 text-xs font-medium ${style}`}>
      {label}: {value ?? "N/A"}/5
    </div>
  );
}
