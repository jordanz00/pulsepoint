"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { DEMO_CTA, LEADERSHIP_STATS } from "@/lib/marketing-home";
import { SALES_CTAS } from "@/lib/marketing-catalog";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { moduleCssVars } from "@/lib/module-colors";
import { enterStaticDemo } from "@/lib/static-demo/session";

const isGhPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
const basePath = isGhPages ? "/pulsepoint" : "";

function DemoCtaStats() {
  const featured = LEADERSHIP_STATS.slice(0, 3);
  return (
    <ul className="mk-demo-stat-row" aria-hidden>
      {featured.map((stat) => (
        <li key={stat.id} style={moduleCssVars(stat.productId)}>
          <div className={`mk-demo-stat-value mk-demo-stat-value--${stat.id}`}>
            <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
          </div>
          <span className="mk-demo-stat-label">{stat.label}</span>
        </li>
      ))}
    </ul>
  );
}

function DemoCtaShell({ children }: { children: ReactNode }) {
  return (
    <div className="mk-demo-cta-band mk-liquid-glass">
      <div className="mk-demo-cta-shine" aria-hidden />
      <div className="mk-demo-cta-inner">{children}</div>
    </div>
  );
}

export function DemoCtaPremium({ standalone = false }: { standalone?: boolean }) {
  if (!standalone) {
    return (
      <section className="mk-section">
        <div className="mk-container">
          <DemoCtaShell>
            <div className="text-center">
              <DemoCtaStats />
              <h2 className="pc-display mk-demo-cta-title mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-[length:clamp(2.25rem,4vw,3rem)]">
                {DEMO_CTA.headline}
              </h2>
              <p className="mk-demo-cta-lead mx-auto mt-4 max-w-lg text-[16px] leading-[1.5]">
                {DEMO_CTA.lead}
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/sign-up" className="pc-btn-primary mk-hero-cta-primary min-h-[3rem] px-8">
                  Request a demo
                </Link>
                <a
                  href={SALES_CTAS.bookCall.href}
                  className="pc-btn-secondary min-h-[3rem]"
                  target={SALES_CTAS.bookCall.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    SALES_CTAS.bookCall.href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                >
                  {SALES_CTAS.bookCall.label}
                </a>
              </div>
            </div>
          </DemoCtaShell>
        </div>
      </section>
    );
  }

  const walkthroughInner = (
    <>
      <p className="mk-demo-cta-card-title">{DEMO_CTA.walkthrough}</p>
      <p className="mk-demo-cta-card-lead">Guided tour with Next bar.</p>
      {isGhPages ? (
        <button
          type="button"
          className="pc-btn-primary mk-hero-cta-primary mt-7 min-h-[3rem] w-full"
          onClick={() => {
            enterStaticDemo("walkthrough");
            window.location.href = `${basePath}/demo-healthcare/walkthrough/?step=0`;
          }}
        >
          Start walkthrough
        </button>
      ) : (
        <button type="submit" className="pc-btn-primary mk-hero-cta-primary mt-7 min-h-[3rem] w-full">
          Start walkthrough
        </button>
      )}
    </>
  );

  const suiteInner = (
    <>
      <p className="mk-demo-cta-card-title">{DEMO_CTA.suite}</p>
      <p className="mk-demo-cta-card-lead">Explore every module freely.</p>
      {isGhPages ? (
        <button
          type="button"
          className="pc-btn-secondary mt-7 min-h-[3rem] w-full"
          onClick={() => {
            enterStaticDemo("suite");
            window.location.href = `${basePath}/demo-healthcare/suite/`;
          }}
        >
          Open full suite
        </button>
      ) : (
        <button type="submit" className="pc-btn-secondary mt-7 min-h-[3rem] w-full">
          Open full suite
        </button>
      )}
    </>
  );

  return (
    <section id="demo" className="mk-section">
      <div className="mk-container">
        <DemoCtaShell>
          <div className="mx-auto max-w-2xl text-center">
            <DemoCtaStats />
            <h2 className="pc-display mk-demo-cta-title mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-[length:clamp(2.25rem,4vw,3rem)]">
              {DEMO_CTA.headline}
            </h2>
            <p className="mk-demo-cta-lead mt-4 text-[15px] leading-relaxed">{DEMO_CTA.lead}</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            {isGhPages ? (
              <div className="mk-demo-cta-card pp-glass-surface glass">{walkthroughInner}</div>
            ) : (
              <form action="/api/demo/enter" method="post" className="mk-demo-cta-card pp-glass-surface glass">
                <input type="hidden" name="mode" value="walkthrough" />
                {walkthroughInner}
              </form>
            )}
            {isGhPages ? (
              <div className="mk-demo-cta-card pp-glass-surface glass">{suiteInner}</div>
            ) : (
              <form action="/api/demo/enter" method="post" className="mk-demo-cta-card pp-glass-surface glass">
                <input type="hidden" name="mode" value="suite" />
                {suiteInner}
              </form>
            )}
          </div>
        </DemoCtaShell>
      </div>
    </section>
  );
}
