import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { BrandLogo } from "@/components/brand-logo";
import { MarketingMobileNav } from "@/components/marketing/marketing-mobile-nav";

const NAV = [
  { href: "#what-is", label: "Overview" },
  { href: "#why-pulsepoint", label: "Why PulsePoint" },
  { href: "#features", label: "Platform" },
  { href: "#membercore", label: "Members" },
  { href: "#events", label: "Events" },
  { href: "#learn-workforce", label: "Workforce" },
  { href: "#enterprise-stack", label: "M365 + DNN" },
  { href: "#integrations", label: "Integrations" },
  { href: "#faq", label: "FAQ" },
  { href: "/compare-protech", label: "vs Protech", isRoute: true },
] as const;

export function MarketingHeader({
  userId,
  standalone = false,
}: {
  userId: string | null | undefined;
  standalone?: boolean;
}) {
  const dashboardHref = standalone ? "/demo-healthcare" : "/dashboard";
  const demoHref = "/demo";

  return (
    <header className="glass mk-glass-header sticky top-0 z-50">
      <div className="mk-container flex flex-wrap items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo size="md" priority />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--glass-fg)]">
            {BRAND_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex lg:gap-6" aria-label="Primary">
          {NAV.map((item) =>
            "isRoute" in item && item.isRoute ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium tracking-[-0.005em] text-[var(--glass-fg-muted)] transition-colors hover:text-[var(--glass-fg)]"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium tracking-[-0.005em] text-[var(--glass-fg-muted)] transition-colors hover:text-[var(--glass-fg)]"
              >
                {item.label}
              </a>
            ),
          )}
          {standalone ? (
            <a
              href="#demo"
              className="text-[13px] font-medium tracking-[-0.005em] text-[var(--glass-fg-muted)] transition-colors hover:text-[var(--glass-fg)]"
            >
              Demo
            </a>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <MarketingMobileNav />
          {userId ? (
            <Link href={dashboardHref} className="btn-primary !min-h-9 !rounded-full !px-5 !py-2 !text-[13px]">
              Open dashboard
            </Link>
          ) : (
            <>
              {!standalone ? (
                <Link
                  href="/sign-in"
                  className="hidden min-h-9 items-center px-3 text-[13px] font-medium text-[var(--glass-fg-muted)] hover:text-[var(--glass-fg)] sm:inline-flex"
                >
                  Sign in
                </Link>
              ) : null}
              <Link href={demoHref} className="btn-primary !min-h-9 !rounded-full !px-5 !py-2 !text-[13px]">
                {standalone ? "Try demo" : "Request demo"}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
