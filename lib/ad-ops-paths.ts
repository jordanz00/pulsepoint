/** URL helpers for integrated healthcare ad-ops UI (under org admin). */

export function adOpsBase(orgSlug: string): string {
  return `/${orgSlug}/advertising`;
}

export function adOpsPaths(orgSlug: string) {
  const base = adOpsBase(orgSlug);
  return {
    home: base,
    campaigns: `${base}/campaigns`,
    campaign: (id: string) => `${base}/campaigns/${id}`,
    sync: `${base}/sync`,
    audit: `${base}/audit`,
    onboarding: `${base}/onboarding`,
    metrics: `${base}/metrics`,
    runbook: (code: string) => `${base}/runbooks/${code}`,
  };
}
