import Link from "next/link";

const navItems = [
  { href: "/?view=map#map", label: "Map" },
  { href: "/?view=list#countries", label: "Countries" },
  { href: "/specialists", label: "Specialists" },
  { href: "/#journal", label: "Journal" },
] as const;

export function TopNavbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#121614]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tighter text-[#F0F2F0] transition hover:text-white md:text-base"
        >
          Atlas
        </Link>

        <nav className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#AEB9B1] md:gap-6 md:text-xs">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-[#F0F2F0]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
