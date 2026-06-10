import { ASSOCIATION_SPINE_MARKETING } from "@/lib/marketing-home";
import { FeatureIcon } from "@/components/marketing/feature-icon";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { moduleCssVars } from "@/lib/module-colors";
import type { ProductId } from "@/lib/products";

/** Compact proof row — replaces long trust + spine bands. */
export function MarketingProofBand() {
  const spine = ASSOCIATION_SPINE_MARKETING;

  return (
    <section className="pp-proof-band mk-section-tight" aria-label="Platform outcomes">
      <div className="mk-container">
        <RevealOnView>
          <header className="pp-proof-band-head">
            <p className="mk-section-eyebrow">{spine.eyebrow}</p>
            <h2 className="pp-proof-band-title">{spine.headline}</h2>
            <p className="pp-proof-band-lead">{spine.lead}</p>
          </header>
        </RevealOnView>

        <div className="pp-proof-band-grid">
          {spine.lanes.map((lane, i) => (
            <RevealOnView key={lane.id} delayMs={i * 50}>
              <article
                className="pp-proof-band-card"
                style={moduleCssVars(lane.productId as ProductId)}
              >
                <div className="pp-proof-band-card-icon">
                  <FeatureIcon
                    icon={lane.icon}
                    productId={lane.productId as ProductId}
                    size="md"
                  />
                </div>
                <h3 className="pp-proof-band-card-title">{lane.title}</h3>
                <p className="pp-proof-band-card-summary">{lane.summary}</p>
                <p className="pp-proof-band-card-modules">
                  {lane.modules.join(" · ")}
                </p>
              </article>
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}
