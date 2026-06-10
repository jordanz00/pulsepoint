import Link from "next/link";
import { WhyPulsePointGapCompare } from "@/components/marketing/why-pulsepoint-gap-compare";
import { WhyPulsePointModuleFilm } from "@/components/marketing/why-pulsepoint-module-film";
import { WhyPulsePointChapterNav } from "@/components/marketing/why-pulsepoint-chapter-nav";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { WHAT_MAKES_IT_DIFFERENT } from "@/lib/marketing-home";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

export function VsLegacyPremiumSection() {
  const w = WHAT_MAKES_IT_DIFFERENT;

  return (
    <section
      id="why-pulsepoint"
      className="pp-flagship mk-section scroll-mt-28"
      aria-labelledby="pp-flagship-title"
    >
      <div className="pp-flagship-aurora" aria-hidden />
      <div className="pp-flagship-grid" aria-hidden />
      <div className="mk-container pp-flagship-inner">
        <div className="pp-flagship-intro">
          <RevealOnView>
            <header className="pp-flagship-header">
              <p className="pp-flagship-eyebrow">{w.eyebrow}</p>
              <h2 id="pp-flagship-title" className="pp-flagship-title">
                {w.headline}
              </h2>
              <p className="pp-flagship-title-accent">{w.headlineAccent}</p>
              <p className="pp-flagship-lead">{w.lead}</p>
            </header>
          </RevealOnView>

          <WhyPulsePointChapterNav />
        </div>

        <RevealOnView delayMs={60}>
          <div className="pp-flagship-metrics" aria-label="Platform at a glance">
            {w.headlineStats.map((stat) => (
              <article
                key={stat.id}
                className="pp-flagship-metric mk-liquid-glass"
                style={moduleCssVars(stat.productId as ProductId)}
              >
                <p className="pp-flagship-metric-value">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="pp-flagship-metric-label">{stat.label}</p>
                <p className="pp-flagship-metric-detail">{stat.detail}</p>
              </article>
            ))}
          </div>
        </RevealOnView>

        <RevealOnView delayMs={100}>
          <div id="pp-flagship-act-gap" className="pp-flagship-act scroll-mt-32">
            <p className="pp-flagship-act-label">Compare</p>
            <h3 className="pp-flagship-act-title">From fragmented tools to one spine</h3>
            <p className="pp-flagship-act-lead">
              One hospital record. Legacy stacks rarely share it.
            </p>
          </div>
        </RevealOnView>

        <RevealOnView delayMs={120}>
          <WhyPulsePointGapCompare />
        </RevealOnView>

        <RevealOnView delayMs={140}>
          <div id="pp-flagship-act-product" className="pp-flagship-act scroll-mt-32">
            <p className="pp-flagship-act-label">Product</p>
            <h3 className="pp-flagship-act-title">Every module reads the same hospital record</h3>
            <p className="pp-flagship-act-lead">
              Real interface patterns from the demo—not a slide deck of icons.
            </p>
          </div>
        </RevealOnView>

        <RevealOnView delayMs={160}>
          <WhyPulsePointModuleFilm />
        </RevealOnView>

        <RevealOnView delayMs={180}>
          <footer id="pp-flagship-act-proof" className="pp-flagship-footer scroll-mt-32">
            <p className="pp-flagship-closing">{w.closing}</p>
            <p className="pp-flagship-disclaimer">{w.disclaimer}</p>
            <div className="pp-flagship-cta-row">
              <Link href="/demo" className="pc-btn-primary !rounded-full px-8">
                Open interactive demo
              </Link>
              <a href="#features" className="pc-btn-secondary !rounded-full px-8">
                Explore all modules
              </a>
            </div>
          </footer>
        </RevealOnView>
      </div>
    </section>
  );
}
