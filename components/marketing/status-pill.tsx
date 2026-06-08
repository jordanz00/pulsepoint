import type { CatalogStatus } from "@/lib/marketing-catalog";

export function StatusPill({ status }: { status: CatalogStatus }) {
  const label =
    status === "available" ? "Live" : status === "alpha" ? "Preview" : "Coming soon";
  const cls =
    status === "available"
      ? "mk-status-live"
      : status === "alpha"
        ? "mk-status-alpha"
        : "mk-status-roadmap";
  return <span className={cls}>{label}</span>;
}
