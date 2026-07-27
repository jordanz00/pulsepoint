import type { Metadata } from "next";
import Link from "next/link";
import { BUILT_BY_COMMS } from "@/lib/built-by-comms-marketing";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { SkipToMain } from "@/components/skip-to-main";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

export const metadata: Metadata = {
  title: "Built by comms — PulsePoint portfolio story",
  description: BUILT_BY_COMMS.lead,
};

function statusBadge(status: "alpha" | "preview") {
  return status === "alpha" ? (
    <span className="badge-alpha">Alpha</span>
  ) : (
    <span className="badge-roadmap">Demo preview</span>
  );
}

export default function BuiltByCommsPage() {
  const standalone = isStandalonePrototype();
  const resolvedUserId: string | null = null;

  const c = BUILT_BY_COMMS;

  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={resolvedUserId} standalone={standalone} />
      <main id="main-content" className="pp-built-by-comms">
        <div className="mk-container py-16 max-w-3xl mx-auto">
          <p className="mk-section-eyebrow">{c.eyebrow}</p>
          <h1 className="pp-built-by-comms-headline">{c.headline}</h1>
          <p className="pp-built-by-comms-lead mt-4">{c.lead}</p>
          <blockquote className="pp-built-by-comms-pitch mt-8">{c.pitch}</blockquote>

          <ol className="pp-built-by-comms-timeline mt-12">
            {c.weeks.map((week) => (
              <li key={week.id} className="pp-built-by-comms-week mk-liquid-glass">
                <div className="pp-built-by-comms-week-head">
                  <span className="pp-built-by-comms-week-label">{week.label}</span>
                  {statusBadge(week.status)}
                </div>
                <h2 className="pp-built-by-comms-week-title">{week.title}</h2>
                <p className="pp-built-by-comms-week-summary">{week.summary}</p>
                <ul className="pp-built-by-comms-routes">
                  {week.routes.map((route) => (
                    <li key={route.href}>
                      <Link href={route.href} className="pc-link font-semibold">
                        {route.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="pp-built-by-comms-master mt-12">
            <h2 className="text-lg font-semibold">20-minute master demo path</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {c.masterDemo.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="pc-btn-secondary text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-sm text-[var(--fg-muted)]">{c.disclaimer}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo" className="pc-btn-primary">
              Open interactive demo
            </Link>
            <Link href="/" className="pc-btn-secondary">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooterPremium />
    </div>
  );
}
