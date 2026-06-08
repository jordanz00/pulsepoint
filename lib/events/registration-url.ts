/** Absolute public registration URL for an org event microsite. */
export function buildEventRegistrationUrl(orgSlug: string, publicSlug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/${orgSlug}/e/${publicSlug}`;
}

/** In-app path to the public registration page. */
export function eventRegistrationPath(orgSlug: string, publicSlug: string): string {
  return `/${orgSlug}/e/${publicSlug}`;
}
