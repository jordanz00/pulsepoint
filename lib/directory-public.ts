/**
 * Public directory visibility — org-level toggle for member directory.
 *
 * Reads `directoryPublic` from Organization.directoryConfig JSON.
 * Demo org defaults to public when unset.
 */

import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

export function isDirectoryPublic(org: {
  slug: string;
  directoryConfig: unknown;
}): boolean {
  if (org.directoryConfig && typeof org.directoryConfig === "object") {
    const cfg = org.directoryConfig as Record<string, unknown>;
    if (typeof cfg.directoryPublic === "boolean") {
      return cfg.directoryPublic;
    }
  }
  return org.slug === DEMO_ORG_SLUG;
}
