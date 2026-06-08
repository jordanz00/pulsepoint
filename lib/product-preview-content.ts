/**
 * Roadmap module preview copy — admin coming-soon pages.
 */

import type { ProductId } from "@/lib/products";
import { PHASE_LABELS, ROADMAP_MODULE_SPECS } from "@/lib/roadmap-modules";

export type ProductPreview = {
  headline: string;
  vision: string;
  bullets: string[];
  vsProtech: string;
  targetPhase: string;
  dependencies: string[];
  successMetrics: string[];
  liveAlternative: string;
};

export const PRODUCT_PREVIEWS: Record<ProductId, ProductPreview> = Object.fromEntries(
  (Object.keys(ROADMAP_MODULE_SPECS) as ProductId[]).map((id) => {
    const spec = ROADMAP_MODULE_SPECS[id];
    return [
      id,
      {
        headline: spec.headline,
        vision: spec.vision,
        bullets: spec.capabilities,
        vsProtech: spec.vsProtech,
        targetPhase: PHASE_LABELS[spec.targetPhase],
        dependencies: spec.dependencies,
        successMetrics: spec.successMetrics,
        liveAlternative: spec.liveAlternative,
      },
    ];
  }),
) as Record<ProductId, ProductPreview>;
