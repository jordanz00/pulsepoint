import Link from "next/link";
import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

/** Marketing — Learn / workforce portfolio band (career fair + video). */
export function LearnWorkforceShowcaseSection() {
  return (
    <section id="learn-workforce" className="mk-section mk-container">
      <div className="pp-learn-workforce-showcase glass pp-glass-surface mk-liquid-glass">
        <div className="pp-learn-workforce-showcase__copy">
          <p className="mk-section-eyebrow">PulsePoint Learn · Alpha</p>
          <h2 className="mk-section-title">Workforce pipeline on the member graph</h2>
          <p className="mk-section-lead mt-3">
            Curated video playlists, virtual career fair booth grids, and CE tracking—without a
            separate LMS silo. Solo-built for hospital association workforce campaigns.
          </p>
          <ul className="pp-learn-workforce-showcase__list">
            <li>Career pipeline video playlist with embed player</li>
            <li>Public booth grid — Brazen-class UX preview</li>
            <li>Workforce programs tied to events and member personas</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/demo" className="pc-btn-primary">
              Enter demo → workforce
            </Link>
            <Link
              href={`/${DEMO_ORG_SLUG}/e/nursing-career-fair-2026`}
              className="pc-btn-secondary"
            >
              Public career fair
            </Link>
            <Link href="/compare-protech" className="pc-btn-secondary">
              vs Protech
            </Link>
          </div>
        </div>
        <div className="pp-learn-workforce-showcase__visual" aria-hidden="true">
          <div className="pp-learn-workforce-showcase__frame">
            <div className="pp-learn-workforce-showcase__frame-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="pp-learn-workforce-showcase__frame-body">
              <div className="pp-learn-workforce-showcase__tiles">
                <div className="pp-learn-workforce-showcase__tile">▶ Video</div>
                <div className="pp-learn-workforce-showcase__tile">Booth A</div>
                <div className="pp-learn-workforce-showcase__tile">Booth B</div>
                <div className="pp-learn-workforce-showcase__tile">CE track</div>
              </div>
              <p className="pp-learn-workforce-showcase__caption">Learn · workforce · career fair</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
