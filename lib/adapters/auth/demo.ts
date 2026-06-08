/**
 * Demo auth adapter — signed cookie, no third party. Always available.
 * Used when DEMO_MODE=true; also acts as the lowest-cost fallback when no
 * external provider is configured.
 */

import type { AuthAdapter, AuthSession } from "@/lib/adapters/types";
import { getDemoSession, isDemoModeEnabled } from "@/lib/demo-mode";

export const demoAuthAdapter: AuthAdapter = {
  id: "demo",

  isConfigured() {
    return isDemoModeEnabled();
  },

  signInPath() {
    return "/demo";
  },

  async getSession(): Promise<AuthSession | null> {
    const demo = await getDemoSession();
    if (!demo) return null;
    return {
      userId: demo.userId,
      email: null,
      providerOrgId: demo.orgId,
      providerRole: demo.role,
    };
  },
};
