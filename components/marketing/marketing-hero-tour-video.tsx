import Link from "next/link";

/** Marketing hero — guided tour / demo CTA for portfolio. */
export function MarketingHeroTourVideo() {
  return (
    <section className="pp-hero-tour glass pp-glass-surface mk-container" aria-labelledby="hero-tour-heading">
      <div className="pp-hero-tour__copy">
        <p className="pp-eyebrow">See it in 60 seconds</p>
        <h2 id="hero-tour-heading" className="pp-hero-tour__title">
          Watch the association story unfold
        </h2>
        <p className="pp-hero-tour__sub">
          Guided walkthrough of Sterling Healthcare — executive home, advocacy stories, workforce
          video, board-ready reports, and Protech import staging. Built with Quake OS + Cursor.
        </p>
        <div className="pp-hero-tour__actions">
          <Link href="/demo" className="pc-btn-primary">
            Start guided tour
          </Link>
          <Link href="/compare-protech" className="pc-btn-secondary">
            vs Protech
          </Link>
        </div>
        <p className="mt-3 text-xs text-[var(--readable-on-light-muted)]">
          Choose <strong>Guided tour</strong> on the demo page — cookie set automatically.
        </p>
      </div>
      <div className="pp-hero-tour__preview" aria-hidden="true">
        <div className="pp-hero-tour__frame">
          <div className="pp-hero-tour__frame-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="pp-hero-tour__frame-body">
            <div className="pp-hero-tour__play">▶</div>
            <p className="pp-hero-tour__frame-label">19 stops · ~55 min full · ★ portfolio highlights</p>
          </div>
        </div>
      </div>
    </section>
  );
}
