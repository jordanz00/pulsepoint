"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MARKETING_HERO } from "@/lib/marketing-home";
import { SALES_CTAS } from "@/lib/marketing-catalog";
import { BrandLogo } from "@/components/brand-logo";
import { HeroStatStrip } from "@/components/marketing/hero-stat-strip";
import { HeroProductPreview } from "@/components/marketing/hero-product-preview";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";

export function MarketingHeroPremium({
  standalone = false,
}: {
  userId?: string | null;
  standalone?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(reduced);
  const demoHref = standalone ? "/demo" : "/sign-up";
  const previewDemoHref = "/demo";

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, [reduced]);

  const shellClass = `mk-hero-stack${ready ? " mk-hero-stack--ready" : ""}`;

  return (
    <section className={`mk-hero-gradient mk-section-hero mk-section-hero--stacked overflow-hidden ${shellClass}`}>
      <div className="mk-container">
        <header className="mk-hero-intro" aria-labelledby="mk-hero-headline">
          <div className="mk-hero-stage mk-hero-stage--brand" style={{ animationDelay: "0ms" }}>
            <BrandLogo size="hero" priority />
            <p className="mk-hero-product-tagline">{MARKETING_HERO.productTagline}</p>
          </div>

          <h1 id="mk-hero-headline" className="mk-hero-headline mk-hero-headline--display mk-hero-stage" style={{ animationDelay: "80ms" }}>
            {MARKETING_HERO.headline}
          </h1>

          <p className="mk-hero-lead mk-hero-stage" style={{ animationDelay: "140ms" }}>
            {MARKETING_HERO.subhead}
          </p>

          {MARKETING_HERO.valuePills.length > 0 ? (
            <ul className="mk-hero-pills mk-hero-stage" aria-label="Core capabilities" style={{ animationDelay: "200ms" }}>
              {MARKETING_HERO.valuePills.map((pill) => (
                <li key={pill} className="mk-hero-pill glass">
                  {pill}
                </li>
              ))}
            </ul>
          ) : null}

          <HeroStatStrip />

          <div className="mk-hero-cta-row mk-hero-stage" style={{ animationDelay: "260ms" }}>
            <Link
              href={demoHref}
              className="btn-primary mk-hero-cta-primary min-w-[220px] !rounded-full px-8 !py-3.5 !text-[15px] !font-semibold"
            >
              {standalone ? MARKETING_HERO.ctaPrimary : "Request a demo"}
            </Link>
            <a
              href="#why-pulsepoint"
              className="pc-btn-secondary min-w-[180px] px-8"
            >
              Why PulsePoint
            </a>
            <a
              href={SALES_CTAS.bookCall.href}
              className="pc-btn-secondary min-w-[180px] px-8 hidden sm:inline-flex"
              target={SALES_CTAS.bookCall.href.startsWith("http") ? "_blank" : undefined}
              rel={SALES_CTAS.bookCall.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {SALES_CTAS.bookCall.label}
            </a>
          </div>

          {MARKETING_HERO.trustLine ? (
            <p className="mk-hero-trust mk-hero-stage" style={{ animationDelay: "320ms" }}>
              {MARKETING_HERO.trustLine}
            </p>
          ) : null}
        </header>

        <div className="mk-hero-demo-wrap mk-hero-stage" style={{ animationDelay: "400ms" }}>
          <div className="mk-hero-demo-header">
            <span className="mk-hero-demo-eyebrow">{MARKETING_HERO.demoLabel}</span>
          </div>
          <div className="mk-hero-demo-frame mk-hero-demo-frame--liquid glass pp-glass-surface mk-hero-demo-frame--glow">
            <HeroProductPreview demoHref={previewDemoHref} />
          </div>
        </div>
      </div>
    </section>
  );
}
