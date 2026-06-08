import { loadAdminModuleStats } from "@/lib/load-admin-module-stats";
import { ModuleLandingBriefingPanel } from "@/components/platform/module-landing-briefing-panel";
import type { ProductId } from "@/lib/products";

type Props = {
  orgId: string;
  orgSlug: string;
  productId: ProductId;
  /** Override auto-loaded stat (e.g. page-specific count) */
  liveStat?: string;
};

/** Server wrapper — loads live module stats, renders glass landing briefing. */
export async function ModuleLandingBriefing({ orgId, orgSlug, productId, liveStat }: Props) {
  const stats = liveStat ? undefined : await loadAdminModuleStats(orgId);
  return (
    <ModuleLandingBriefingPanel
      orgSlug={orgSlug}
      productId={productId}
      liveStat={liveStat ?? stats?.[productId]}
    />
  );
}
