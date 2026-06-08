/**
 * Integration profile — demo vs future HAP + Azure enterprise wiring.
 *
 * WHO THIS IS FOR: Developers swapping auth, brand, and hosting when PulsePoint
 * moves from standalone demo to HAP / Microsoft production.
 *
 * WHAT IT DOES: Reads INTEGRATION_PROFILE from env (default: demo). UI and
 * auth adapters branch on this — do not hardcode haponline.org or HAP assets
 * outside hap-azure profile.
 *
 * See docs/ENTERPRISE-INTEGRATION.md for the full swap map.
 */

export type IntegrationProfileId = "demo" | "pilot-entra" | "hap-azure";

export type IntegrationProfile = {
  id: IntegrationProfileId;
  /** Product display name in chrome */
  productName: string;
  /** Optional link back to parent marketing site (unset in demo) */
  marketingSiteUrl: string | null;
  /** Use HAP logo + enterprise theme when true */
  useHapBrand: boolean;
  /** Clerk is the default production auth adapter today; Entra replaces it in hap-azure */
  authAdapter: "demo-cookie" | "clerk" | "entra";
};

const DEMO_PROFILE: IntegrationProfile = {
  id: "demo",
  productName: "PulsePoint",
  marketingSiteUrl: null,
  useHapBrand: false,
  authAdapter: "demo-cookie",
};

const PILOT_ENTRA_PROFILE: IntegrationProfile = {
  id: "pilot-entra",
  productName: "PulsePoint",
  marketingSiteUrl: null,
  useHapBrand: false,
  authAdapter: "entra",
};

const HAP_AZURE_PROFILE: IntegrationProfile = {
  id: "hap-azure",
  productName: "PulsePoint",
  marketingSiteUrl: process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? "https://www.haponline.org",
  useHapBrand: true,
  authAdapter: "entra",
};

/**
 * Active profile. Default demo — no HAP or Azure coupling unless explicitly enabled.
 */
export function getIntegrationProfile(): IntegrationProfile {
  const raw = process.env.INTEGRATION_PROFILE?.trim().toLowerCase();
  if (raw === "hap-azure" || raw === "hap_azure" || raw === "hap") {
    return HAP_AZURE_PROFILE;
  }
  if (raw === "pilot-entra" || raw === "pilot_entra") {
    return PILOT_ENTRA_PROFILE;
  }
  return DEMO_PROFILE;
}

/** True when Entra adapter should take precedence over Clerk (pilot or enterprise). */
export function isEntraAuthProfile(): boolean {
  const id = getIntegrationProfile().id;
  return id === "pilot-entra" || id === "hap-azure";
}

export function isDemoProfile(): boolean {
  return getIntegrationProfile().id === "demo";
}

export function isHapAzureProfile(): boolean {
  return getIntegrationProfile().id === "hap-azure";
}
