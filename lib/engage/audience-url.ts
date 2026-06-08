/** Deep link to Engage send form with audience pre-selected. */
export function engageAudienceUrl(orgSlug: string, audienceId: string): string {
  return `/${orgSlug}/engage?audienceId=${encodeURIComponent(audienceId)}`;
}
