/**
 * Standalone prototype — no Clerk (or other paid auth) when demo mode is on.
 *
 * Same gates as lib/demo-mode.ts: DEMO_MODE=true, non-production, secret set.
 */

import { isDemoModeEnabled } from "@/lib/demo-mode-gates";

export function isStandalonePrototype(): boolean {
  return isDemoModeEnabled();
}

export function authRedirectPath(): string {
  return isStandalonePrototype() ? "/demo" : "/sign-in";
}
