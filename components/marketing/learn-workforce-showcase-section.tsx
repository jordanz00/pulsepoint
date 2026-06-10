import Link from "next/link";
import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";
import { LearnWorkforceShowcasePreview } from "@/components/marketing/learn-workforce-showcase-preview";

/** Marketing — Learn / workforce portfolio band (career fair + video). */
export function LearnWorkforceShowcaseSection() {
  return (
    <section id="learn-workforce" className="mk-section mk-container">
      <div className="pp-learn-workforce-showcase">
        <div className="pp-learn-workforce-showcase__copy">
          <p className="mk-section-eyebrow">PulsePoint Learn · Alpha</p>
          <h2 className="mk-section-title">Workforce pipeline on the member graph</h2>
          <p className="mk-section-lead mt-3">
            Curated video playlists, virtual career fair booth grids, and CE tracking—without a
            separate LMS silo. Built for hospital association workforce campaigns.
          </p>
          <ul className="pp-learn-workforce-showcase__list">
            <li>Real employer booth grid on the public event microsite</li>
            <li>Workforce CE embeds with honest Alpha labels</li>
            <li>Programs tied to member personas and event registration</li>
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
            <Link href="/built-by-comms" className="pc-btn-secondary">
              Portfolio story
            </Link>
          </div>
        </div>
        <LearnWorkforceShowcasePreview />
      </div>
    </section>
  );
}
