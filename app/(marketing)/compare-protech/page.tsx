import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPARE_PROTECH_CLOSING,
  COMPARE_PROTECH_HEADLINE,
  COMPARE_PROTECH_LEAD,
  COMPARE_PROTECH_ROWS,
} from "@/lib/marketing/compare-protech";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { SkipToMain } from "@/components/skip-to-main";
import { isStandalonePrototype } from "@/lib/standalone-prototype";
import { getDemoSession } from "@/lib/demo-mode";

export const metadata: Metadata = {
  title: "PulsePoint vs Protech — honest comparison",
  description: COMPARE_PROTECH_LEAD,
};

function statusBadge(status: "live" | "alpha" | "roadmap") {
  if (status === "live") return <span className="badge-live">Live</span>;
  if (status === "alpha") return <span className="badge-alpha">Alpha</span>;
  return <span className="badge-roadmap">Roadmap</span>;
}

export default async function CompareProtechPage() {
  const standalone = isStandalonePrototype();
  let resolvedUserId: string | null = null;
  try {
    if (standalone) {
      resolvedUserId = (await getDemoSession())?.userId ?? null;
    } else {
      const { auth } = await import("@clerk/nextjs/server");
      resolvedUserId = (await auth()).userId ?? null;
    }
  } catch {
    resolvedUserId = null;
  }

  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={resolvedUserId} standalone={standalone} />
      <main id="main-content" className="mk-section mk-container py-16 max-w-4xl mx-auto">
        <p className="mk-section-eyebrow">Competitive positioning</p>
        <h1 className="ds-page-title text-3xl">{COMPARE_PROTECH_HEADLINE}</h1>
        <p className="ds-page-subtitle mt-4">{COMPARE_PROTECH_LEAD}</p>

        <div className="mt-10 space-y-4">
          {COMPARE_PROTECH_ROWS.map((row) => (
            <article key={row.category} className="mk-bento-card mk-liquid-glass p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="font-semibold text-lg">{row.category}</h2>
                {statusBadge(row.pulseStatus)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="mk-vs-label mk-vs-label--legacy mb-1">Typical Protech / Dynamics AMS</p>
                  <p className="text-[var(--pc-text-secondary)]">{row.protech}</p>
                </div>
                <div>
                  <p className="mk-vs-label mk-vs-label--pulse mb-1">PulsePoint today</p>
                  <p className="text-[var(--pc-text)]">{row.pulsepoint}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-[var(--pc-text-secondary)]">{COMPARE_PROTECH_CLOSING}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/demo" className="pc-btn-primary">
            Enter demo
          </Link>
          <Link href="/demo-healthcare/members/imports" className="pc-btn-secondary">
            Import staging (demo org)
          </Link>
          <Link href="/" className="pc-btn-secondary">
            Back to home
          </Link>
        </div>
      </main>
      <MarketingFooterPremium />
    </div>
  );
}
