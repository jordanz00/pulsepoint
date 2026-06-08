import Link from "next/link";

/** Demo org footer — mirrors marketing “Explore the full suite” band. */
export function DemoSuiteStrip({ orgSlug }: { orgSlug: string }) {
  return (
    <section className="pp-demo-stagger pp-demo-suite-strip glass pp-glass-surface" aria-label="All modules">
      <div className="pp-demo-suite-strip-inner">
        <div className="pp-demo-suite-strip-copy">
          <span className="pp-eyebrow">Full platform</span>
          <h2 className="pp-demo-suite-strip-title">Explore the full suite</h2>
          <p className="pp-demo-suite-strip-lead">
            Same colored module icons as the marketing site—tap any product to open it in this demo.
          </p>
        </div>
        <Link href={`/${orgSlug}/suite`} className="pp-demo-suite-strip-cta pc-btn-primary">
          Open all modules
        </Link>
      </div>
    </section>
  );
}
