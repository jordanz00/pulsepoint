/** Canonical public take-action URL for a launched campaign. */
export function publicTakeActionUrl(orgSlug: string, campaignId: string): string {
  return `/${orgSlug}/advocacy/${campaignId}`;
}
