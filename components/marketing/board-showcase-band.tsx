import Link from "next/link";
import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

/** Landing band — board pack + portfolio story (Week 4). */
export function BoardShowcaseBand() {
  return (
    <section id="board-showcase" className="mk-section mk-section--band pp-board-showcase-band">
      <div className="mk-container">
        <div className="pp-board-showcase-inner mk-liquid-glass">
          <div className="pp-board-showcase-copy">
            <p className="mk-section-eyebrow">Executive reporting</p>
            <h2 className="mk-section-title">Board-ready numbers—not a CSV dump</h2>
            <p className="mk-section-lead mt-3">
              Print a leadership briefing from the same KPI engine staff use daily. Advocacy,
              workforce, and revenue stitched for the board packet.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${DEMO_ORG_SLUG}/insights/board-pack`}
                className="pc-btn-primary !rounded-full"
              >
                Open board pack
              </Link>
              <Link href="/built-by-comms" className="pc-btn-secondary !rounded-full">
                See how it was built
              </Link>
            </div>
          </div>
          <aside className="pp-board-showcase-mock" aria-label="Board pack preview">
            <div className="pp-board-showcase-mock-page">
              <p className="pp-board-showcase-mock-eyebrow">Sterling Healthcare · Board briefing</p>
              <p className="pp-board-showcase-mock-title">Executive snapshot</p>
              <ul className="pp-board-showcase-mock-kpis">
                <li>
                  <strong>94%</strong>
                  <span>Renewal health</span>
                </li>
                <li>
                  <strong>$284K</strong>
                  <span>Revenue MTD</span>
                </li>
                <li>
                  <strong>428</strong>
                  <span>Advocacy responses</span>
                </li>
              </ul>
              <p className="pp-board-showcase-mock-note">
                Print to PDF · illustrative sample · Live KPIs from demo tenant
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
