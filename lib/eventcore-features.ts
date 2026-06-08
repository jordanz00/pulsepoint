/**
 * EventCore capability catalog — ProTech-class EMS, built into PulsePoint.
 */

export type EventCoreFeature = {
  id: string;
  title: string;
  description: string;
};

export const EVENTCORE_CAPABILITIES: EventCoreFeature[] = [
  {
    id: "lifecycle",
    title: "Start to finish",
    description:
      "Draft → publish → run → complete. Clone events, planner checklist, and lifecycle controls in one workspace.",
  },
  {
    id: "sponsors",
    title: "Sponsorship & assets",
    description:
      "Sponsor tiers, booth numbers, logo URLs, and a central asset library for microsite, badges, and CMS export.",
  },
  {
    id: "registration",
    title: "Registration & commerce",
    description:
      "Capacity, tickets, promo codes, waitlist, Stripe checkout, refunds, and staff override on every registration.",
  },
  {
    id: "sessions",
    title: "Session RSVP",
    description:
      "Breakout and CE tracks—assign attendees per session from admin or public microsite.",
  },
  {
    id: "email",
    title: "Email & schedules",
    description:
      "Instant segment sends plus scheduled save-the-date, reminders, and thank-you campaigns (cron-backed).",
  },
  {
    id: "surveys",
    title: "Post-event surveys",
    description:
      "Built-in feedback forms with response counts—no separate survey tool required.",
  },
  {
    id: "badges",
    title: "Badge print",
    description:
      "Auto badge codes and a print-ready layout—Save as PDF from the browser for day-of check-in.",
  },
  {
    id: "easydnn",
    title: "EasyDNN export",
    description:
      "One-click HTML module for your DNN site: agenda, sponsors, speakers, and registration CTA.",
  },
  {
    id: "analytics",
    title: "Analytics & export",
    description:
      "Revenue, fill rate, check-in rate, trends, and audited CSV export—executive-ready at a glance.",
  },
];
