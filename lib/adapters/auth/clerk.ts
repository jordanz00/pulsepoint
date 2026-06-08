/**
 * Clerk auth adapter — primary in `INTEGRATION_PROFILE=demo` when keys are present.
 * Replaceable by lib/adapters/auth/entra.ts (Microsoft) without touching app code.
 */

import type { AuthAdapter, AuthSession } from "@/lib/adapters/types";

async function clerkServer() {
  return import("@clerk/nextjs/server");
}

export const clerkAuthAdapter: AuthAdapter = {
  id: "clerk",

  isConfigured() {
    return Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
    );
  },

  signInPath() {
    return "/sign-in";
  },

  async getSession(): Promise<AuthSession | null> {
    const { auth } = await clerkServer();
    const session = await auth();
    if (!session.userId) return null;
    return {
      userId: session.userId,
      email: null,
      providerOrgId: session.orgId ?? null,
      providerRole: null,
    };
  },
};
