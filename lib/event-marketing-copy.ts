/**
 * EventCore marketing kit — generated copy from event facts (no invented dates).
 */

export type EventMarketingPack = {
  emailSubjects: string[];
  socialPosts: string[];
  newsletterBlurb: string;
  posterHeadline: string;
  posterSubhead: string;
};

function formatEventDate(startsAt: Date, endsAt: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const start = startsAt.toLocaleString(undefined, opts);
  if (!endsAt) return start;
  const end = endsAt.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${start} – ${end}`;
}

export function buildEventMarketingPack(
  event: {
    title: string;
    description: string;
    startsAt: Date;
    endsAt: Date | null;
    publicSlug: string;
  },
  orgName: string,
): EventMarketingPack {
  const dateStr = formatEventDate(event.startsAt, event.endsAt);
  const title = event.title.trim();
  const desc = event.description.trim();

  return {
    emailSubjects: [
      `Register now: ${title}`,
      `Save the date — ${title}`,
      `Join us: ${title} (${dateStr})`,
    ],
    socialPosts: [
      `📅 ${title} — ${dateStr}. Register today via ${orgName}.`,
      `We're hosting ${title}. ${desc ? desc.slice(0, 120) + (desc.length > 120 ? "…" : "") : "Details and registration on our event page."}`,
      `Members & partners: ${title} is open for registration. Don't miss it.`,
    ],
    newsletterBlurb: `${orgName} invites you to ${title} on ${dateStr}.${desc ? ` ${desc}` : ""} Register on our events page.`,
    posterHeadline: title,
    posterSubhead: dateStr,
  };
}
