/**
 * EventCore email merge tags for templates and quick sends.
 */

export type EventMergeContext = {
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  registrationUrl: string;
  firstName?: string;
  displayName?: string;
};

export function applyEventMerge(template: string, ctx: EventMergeContext): string {
  return template
    .replace(/\{\{eventTitle\}\}/gi, ctx.eventTitle)
    .replace(/\{\{eventDate\}\}/gi, ctx.eventDate)
    .replace(/\{\{eventLocation\}\}/gi, ctx.eventLocation ?? "")
    .replace(/\{\{registrationLink\}\}/gi, ctx.registrationUrl)
    .replace(/\{\{registrationUrl\}\}/gi, ctx.registrationUrl)
    .replace(/\{\{firstName\}\}/gi, ctx.firstName ?? "there")
    .replace(/\{\{displayName\}\}/gi, ctx.displayName ?? "there");
}

export const EVENT_EMAIL_PRESETS = [
  {
    id: "reminder",
    name: "Event reminder",
    subject: "Reminder: {{eventTitle}} on {{eventDate}}",
    bodyText:
      "Hi {{firstName}},\n\nThis is a reminder that {{eventTitle}} is coming up on {{eventDate}}.\n\nRegister or view your confirmation: {{registrationLink}}\n\nWe look forward to seeing you.",
  },
  {
    id: "thank_you",
    name: "Thank you / follow-up",
    subject: "Thank you for attending {{eventTitle}}",
    bodyText:
      "Hi {{firstName}},\n\nThank you for being part of {{eventTitle}}. We appreciate your time and participation.\n\n— Event team",
  },
  {
    id: "invite",
    name: "Invitation to register",
    subject: "You're invited: {{eventTitle}}",
    bodyText:
      "Hi {{firstName}},\n\nYou're invited to join us for {{eventTitle}} on {{eventDate}}.\n\nSave your seat: {{registrationLink}}\n\nReply to this email if you have questions.",
  },
  {
    id: "checkin",
    name: "Day-of check-in",
    subject: "{{eventTitle}} — check-in details",
    bodyText:
      "Hi {{firstName}},\n\nDoors open soon for {{eventTitle}} ({{eventDate}}). Bring this email for quick check-in.\n\nDetails: {{registrationLink}}",
  },
] as const;
