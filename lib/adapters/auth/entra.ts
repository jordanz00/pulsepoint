/**
 * Microsoft Entra ID auth adapter — PKCE OAuth + signed session cookie.
 */

import type { AuthAdapter, AuthSession } from "@/lib/adapters/types";
import { isEntraConfigured } from "@/lib/entra-config";
import { getEntraSession } from "@/lib/entra-session";
import { isEntraAuthProfile } from "@/lib/integration-profile";

export const entraAuthAdapter: AuthAdapter = {
  id: "entra",

  isConfigured() {
    return isEntraAuthProfile() && isEntraConfigured();
  },

  signInPath() {
    return "/sign-in";
  },

  async getSession(): Promise<AuthSession | null> {
    if (!this.isConfigured()) return null;
    const session = await getEntraSession();
    if (!session) return null;
    return {
      userId: session.userId,
      email: session.email,
      providerOrgId: session.orgId,
      providerRole: session.role,
    };
  },
};
