import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooterPremium } from "@/components/marketing/marketing-footer-premium";
import { PULSEPOINT_WHATS_NEW } from "@/lib/marketing/whats-new-features";
import { SkipToMain } from "@/components/skip-to-main";

export const metadata = {
  title: "What's New | PulsePoint",
  description: "Latest PulsePoint CRM features inspired by modern relationship management platforms.",
};

export default function WhatsNewPage() {
  return (
    <div className="pp-canvas pp-marketing-canvas min-h-screen">
      <SkipToMain />
      <MarketingHeader userId={null} standalone />

      <main id="main" className="mk-section mk-container py-12 md:py-16 max-w-5xl">
        <p className="mk-section-eyebrow">What&apos;s new</p>
        <h1 className="mk-section-title mt-2">Latest PulsePoint features</h1>
        <p className="mk-section-lead mt-4 max-w-2xl">
          Relationship-first CRM capabilities for healthcare associations — adapted from{" "}
          <a
            href="https://www.nimble.com/whats-new/"
            className="text-[var(--accent-brand)] hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Nimble&apos;s product roadmap
          </a>
          , without AI chat or marketing add-ons.
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {PULSEPOINT_WHATS_NEW.map((f) => (
            <li key={f.id} className="mk-bento-card mk-liquid-glass p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--pc-text)]">
                  {f.title}
                </h2>
                {f.badge ? (
                  <span className="badge-alpha">{f.badge}</span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--pc-text-secondary)]">
                {f.summary}
              </p>
              {f.pulsePath ? (
                <Link href={f.pulsePath} className="mt-4 inline-block text-sm font-semibold text-[var(--accent-brand)]">
                  Try in demo →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/compare-protech" className="pc-btn-primary">
            vs Protech comparison
          </Link>
          <Link href="/demo" className="pc-btn-secondary">
            Enter demo
          </Link>
        </div>
      </main>

      <MarketingFooterPremium />
    </div>
  );
}
