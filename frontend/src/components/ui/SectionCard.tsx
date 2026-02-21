interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={`rounded-xl border border-stone-200/70 bg-white/75 p-6 shadow-sm backdrop-blur-sm ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
