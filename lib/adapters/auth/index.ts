/**
 * Auth adapter resolver — picks the active adapter based on env.
 *
 * Priority:
 *   1. Demo cookie (when DEMO_MODE=true and a valid cookie is present)
 *   2. Clerk (when keys configured)
 *   3. Entra (when INTEGRATION_PROFILE=pilot-entra or hap-azure)
 *   4. null → unauthenticated
 */

import type { AuthAdapter } from "@/lib/adapters/types";
import { clerkAuthAdapter } from "@/lib/adapters/auth/clerk";
import { demoAuthAdapter } from "@/lib/adapters/auth/demo";
import { entraAuthAdapter } from "@/lib/adapters/auth/entra";

export function getActiveAuthAdapters(): AuthAdapter[] {
  // Order matters: demo first (overrides during local/preview), then production providers.
  return [demoAuthAdapter, clerkAuthAdapter, entraAuthAdapter].filter((a) => a.isConfigured());
}

export function getAuthAdapterById(id: string): AuthAdapter | null {
  const all: AuthAdapter[] = [demoAuthAdapter, clerkAuthAdapter, entraAuthAdapter];
  return all.find((a) => a.id === id) ?? null;
}

export { demoAuthAdapter, clerkAuthAdapter, entraAuthAdapter };
