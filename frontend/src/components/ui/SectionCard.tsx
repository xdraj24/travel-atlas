interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_14px_35px_rgba(0,0,0,0.22)] backdrop-blur-[20px] ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
