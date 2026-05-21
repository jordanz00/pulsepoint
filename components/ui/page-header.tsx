import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  subtitle?: string;
  badge?: "live" | "roadmap";
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-6">
      <div className="min-w-0 flex-1">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex text-sm font-medium text-sky-700 hover:text-sky-900"
          >
            ← {backLabel}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--pc-navy)]">
            {title}
          </h1>
          {badge === "live" && <Badge variant="live">Live</Badge>}
          {badge === "roadmap" && <Badge variant="roadmap">Roadmap</Badge>}
        </div>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
