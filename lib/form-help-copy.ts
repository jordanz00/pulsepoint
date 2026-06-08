/**
 * Plain-English field help for forms (no doc links).
 */

export const FORM_HELP = {
  member: {
    firstName: "As it should appear on receipts and certificates.",
    lastName: "Family or preferred last name for the directory.",
    email: "Optional. Used for event confirmations and member email.",
    phone: "Optional. Staff-only unless you publish it to members later.",
    status:
      "Active members count toward totals. Inactive or lapsed stay in the list but may lose access.",
    tags: "Separate multiple tags with commas—for example: Board, Fellow.",
  },
  event: {
    title: "Name shown on the public registration page.",
    description: "Optional details—agenda, location, dress code, and so on.",
    publicSlug:
      "Short web address for the registration link. Use lowercase letters, numbers, and hyphens only.",
    startsAt: "Local date and time when the event begins.",
    endsAt: "Optional. Leave blank for open-ended sessions.",
    capacity: "Optional maximum attendees. Leave blank for no cap.",
    priceDollars: "0 for free events. Paid events can collect checkout when payments are connected.",
    status:
      "Draft is staff-only. Published shows the public registration page.",
  },
  registration: {
    guestName: "Full name for the attendee list and badge.",
    guestEmail: "Your confirmation and receipt are sent here.",
  },
} as const;
