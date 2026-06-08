/**
 * EventCore attendee export — CSV for staff (audited).
 */

export type EventExportRow = {
  registrationId: string;
  displayName: string;
  email: string;
  status: string;
  ticketType: string;
  paid: string;
  checkedIn: string;
  registeredAt: string;
  staffNotes: string;
};

export function buildAttendeeCsv(rows: EventExportRow[]): string {
  const headers = [
    "registration_id",
    "name",
    "email",
    "status",
    "ticket_type",
    "paid",
    "checked_in",
    "registered_at",
    "staff_notes",
  ];
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.registrationId,
        r.displayName,
        r.email,
        r.status,
        r.ticketType,
        r.paid,
        r.checkedIn,
        r.registeredAt,
        r.staffNotes,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}
