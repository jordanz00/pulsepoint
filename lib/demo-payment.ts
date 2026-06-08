/**
 * Demo-mode payment completion — simulates checkout when manual adapter has no redirect.
 *
 * WHO: Local demo and Playwright e2e without Stripe keys.
 * WHAT: Marks registration/order paid and returns success URL instead of failing checkout.
 * SCOPE: Demo mode only — never auto-completes payments in production tenants.
 */

import { isDemoModeEnabled } from "@/lib/demo-mode-gates";

export function shouldSimulateDemoPayment(
  adapterId: string,
  redirectUrl: string | null,
): boolean {
  return isDemoModeEnabled() && adapterId === "manual" && redirectUrl === null;
}
