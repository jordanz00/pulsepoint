import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";

/** @deprecated Prefer PageHeader from @/components/ui — thin wrapper for legacy imports */
export function GlassPageHeader({
  title,
  subtitle,
  badge,
  actions,
  eyebrow,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  badge?: "alpha" | "live" | "roadmap";
  actions?: ReactNode;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      badge={badge}
      actions={actions}
      eyebrow={eyebrow}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
