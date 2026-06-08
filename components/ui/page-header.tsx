import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  badge,
  actions,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: "live" | "alpha" | "roadmap";
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="ds-page-header w-full">
      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        {backHref ? (
          <Link href={backHref} className="ds-page-eyebrow">
            ← {backLabel}
          </Link>
        ) : eyebrow ? (
          <p className="ds-page-eyebrow m-0">{eyebrow}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="ds-page-title">{title}</h1>
          {badge === "live" ? <span className="badge-live">Live</span> : null}
          {badge === "alpha" ? <span className="badge-alpha">Alpha</span> : null}
          {badge === "roadmap" ? <span className="badge-roadmap">Soon</span> : null}
        </div>
        {subtitle ? <p className="ds-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
