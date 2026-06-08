"use client";

const NAV = [
  { href: "#what-is", label: "Overview" },
  { href: "#why-pulsepoint", label: "Why PulsePoint" },
  { href: "#features", label: "Platform" },
  { href: "#membercore", label: "Members" },
  { href: "#events", label: "Events" },
  { href: "#advocacy", label: "Advocacy" },
  { href: "#enterprise-stack", label: "M365 + EasyDNN" },
  { href: "#integrations", label: "Integrations" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
  { href: "#demo", label: "Demo" },
] as const;

export function MarketingMobileNav() {
  return (
    <details className="group relative md:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] px-4 text-[13px] font-medium text-[var(--glass-fg)] [&::-webkit-details-marker]:hidden">
        Menu
        <span className="text-[var(--glass-fg-muted)] transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <nav
        className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] rounded-2xl border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_96%,white)] p-2 shadow-lg backdrop-blur-xl"
        aria-label="Mobile"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block min-h-11 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[var(--glass-fg-muted)] hover:bg-white/50 hover:text-[var(--glass-fg)]"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </details>
  );
}
