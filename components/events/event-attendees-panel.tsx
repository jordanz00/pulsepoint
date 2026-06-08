import { CheckInButton } from "@/components/events/check-in-button";
import { EventAttendeeEmailButton } from "@/components/events/event-attendee-email-button";
import { EventRegistrationRowActions } from "@/components/events/event-registration-row-actions";
import { EventRefundActions } from "@/components/events/event-refund-actions";

export type EventAttendeeRow = {
  id: string;
  displayName: string;
  email: string;
  status: string;
  paid: boolean;
  checkedIn: boolean;
  waitlistPosition: number | null;
  staffNotes: string;
  badgeCode: string | null;
  refundStatus: string;
};

export function EventAttendeesPanel({
  orgSlug,
  eventId,
  rows,
}: {
  orgSlug: string;
  eventId: string;
  rows: EventAttendeeRow[];
}) {
  return (
    <section className="ec-panel glass pp-readable-on-light" id="eventcore-attendees">
      <h2 className="ec-panel-title">Attendees & roster</h2>
      <p className="ec-panel-lead">
        Status, staff notes, check-in, and per-person email. Use the Email tab for mass sends.
      </p>
      {rows.length === 0 ? (
        <p className="text-[var(--readable-on-light-muted)]">No registrations yet.</p>
      ) : (
        <ul className="ec-roster rounded-xl border border-[var(--readable-on-light-border)] bg-white/80">
          {rows.map((r) => (
            <li key={r.id} className="ec-roster-row flex-col items-stretch text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 w-full">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--readable-on-light-fg)]">
                    {r.displayName}
                    {r.waitlistPosition != null ? (
                      <span className="ml-2 text-xs font-normal text-[var(--topic-events-fg)]">
                        Waitlist #{r.waitlistPosition}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[var(--readable-on-light-muted)]">
                    {r.email} · {r.status}
                    {r.paid ? " · Paid" : ""}
                    {r.checkedIn ? " · Checked in" : ""}
                    {r.badgeCode ? ` · Badge ${r.badgeCode}` : ""}
                  </p>
                  <EventRefundActions
                    orgSlug={orgSlug}
                    registrationId={r.id}
                    refundStatus={r.refundStatus}
                    paid={r.paid}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <EventAttendeeEmailButton
                    orgSlug={orgSlug}
                    eventId={eventId}
                    registrationId={r.id}
                    email={r.email}
                    displayName={r.displayName}
                  />
                  <CheckInButton
                    orgSlug={orgSlug}
                    registrationId={r.id}
                    checkedIn={r.checkedIn}
                  />
                </div>
              </div>
              <EventRegistrationRowActions
                orgSlug={orgSlug}
                registrationId={r.id}
                currentStatus={r.status}
                staffNotes={r.staffNotes}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
