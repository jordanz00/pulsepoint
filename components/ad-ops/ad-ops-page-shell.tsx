import type { ReactNode } from "react";
import { GlassPageHeader } from "@/components/admin/glass-page-header";

type Props = {
  eyebrow?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
  children: ReactNode;
  kpiStrip?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function AdOpsPageShell({
  eyebrow = "Healthcare ad-ops",
  title,
  lede,
  actions,
  children,
  kpiStrip,
  backHref,
  backLabel = "Campaigns",
}: Props) {
  return (
    <div className="ad-ops-glass-page space-y-6">
      <GlassPageHeader
        title={title}
        subtitle={lede ? `${eyebrow} · ${lede}` : eyebrow}
        badge="live"
        actions={actions}
        backHref={backHref}
        backLabel={backLabel}
      />
      {kpiStrip}
      <div className="glass pp-glass-surface rounded-2xl p-5">{children}</div>
    </div>
  );
}
