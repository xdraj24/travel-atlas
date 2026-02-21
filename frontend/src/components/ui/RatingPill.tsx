interface RatingPillProps {
  label: string;
  value?: number;
}

export function RatingPill({ label, value }: RatingPillProps) {
  return (
    <div className="rounded-full border border-[#bba98a] bg-[#f4ede1] px-3 py-1 text-xs font-semibold text-[#6f5d43]">
      {label}: {value ?? "N/A"}/5
    </div>
  );
}
