/**
 * Standalone prototype — no Clerk (or other paid auth) when demo mode is on.
 *
 * Same gates as lib/demo-mode.ts: DEMO_MODE=true, non-production, secret set.
 */

import { isDemoModeEnabled } from "@/lib/demo-mode-gates";
import { isGitHubPagesBuild } from "@/lib/github-pages";

export function isStandalonePrototype(): boolean {
  return isDemoModeEnabled() || isGitHubPagesBuild();
}

export function authRedirectPath(): string {
  return isStandalonePrototype() ? "/demo" : "/sign-in";
}
