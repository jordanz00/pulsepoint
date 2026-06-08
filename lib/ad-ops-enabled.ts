/**
 * Feature flag for integrated healthcare ad-ops console routes.
 */
export function isAdOpsEnabled(): boolean {
  const raw = process.env.AD_OPS_ENABLED?.trim().toLowerCase();
  return raw !== "false" && raw !== "0";
}
