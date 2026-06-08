/**
 * EventCore printable badges — HTML for browser print-to-PDF.
 */

export type BadgeAttendee = {
  displayName: string;
  email: string;
  badgeCode: string;
  ticketType?: string;
  organization?: string;
};

export function generateBadgeCode(registrationId: string): string {
  return registrationId.slice(-8).toUpperCase();
}

export function buildBadgePrintHtml(
  eventTitle: string,
  eventDate: string,
  attendees: BadgeAttendee[],
  accent = "#2563eb",
): string {
  const cards = attendees
    .map(
      (a) => `
    <article class="badge-card">
      <div class="badge-event">${escapeHtml(eventTitle)}</div>
      <div class="badge-date">${escapeHtml(eventDate)}</div>
      <div class="badge-name">${escapeHtml(a.displayName)}</div>
      ${a.organization ? `<div class="badge-org">${escapeHtml(a.organization)}</div>` : ""}
      ${a.ticketType ? `<div class="badge-ticket">${escapeHtml(a.ticketType)}</div>` : ""}
      <div class="badge-code">${escapeHtml(a.badgeCode)}</div>
      <div class="badge-qr" aria-hidden="true">▣ ${escapeHtml(a.badgeCode)}</div>
    </article>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Badges — ${escapeHtml(eventTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f1f5f9; }
    .badge-grid { display: grid; grid-template-columns: repeat(2, 3.375in); gap: 12px; }
    .badge-card {
      width: 3.375in; height: 2.125in;
      padding: 14px 16px;
      border-radius: 12px;
      background: linear-gradient(145deg, #fff 0%, #f8fafc 100%);
      border: 2px solid ${accent};
      box-shadow: 0 4px 12px rgba(15,23,42,0.08);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .badge-event { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${accent}; }
    .badge-date { font-size: 8px; color: #64748b; margin-top: 2px; }
    .badge-name { font-size: 15px; font-weight: 800; margin-top: 8px; color: #0f172a; line-height: 1.2; }
    .badge-org, .badge-ticket { font-size: 9px; color: #475569; margin-top: 4px; }
    .badge-code { font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700; margin-top: 8px; color: #0f172a; }
    .badge-qr { font-size: 10px; color: #94a3b8; margin-top: 4px; }
    @media print {
      body { background: white; padding: 0; }
      .badge-grid { gap: 0; }
      .badge-card { margin: 6px; }
    }
  </style>
</head>
<body>
  <p style="font-size:12px;color:#64748b;margin-bottom:12px;">Print with Ctrl/Cmd+P → Save as PDF. ${attendees.length} badge(s).</p>
  <div class="badge-grid">${cards}</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
