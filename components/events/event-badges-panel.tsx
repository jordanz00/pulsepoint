import Link from "next/link";
import { EnsureBadgeCodesButton } from "@/components/events/ensure-badge-codes-button";

export function EventBadgesPanel({
  orgSlug,
  eventId,
  badgeReadyCount,
  totalConfirmed,
}: {
  orgSlug: string;
  eventId: string;
  badgeReadyCount: number;
  totalConfirmed: number;
}) {
  return (
    <section className="ec-panel glass pp-readable-on-light pp-motion-card" id="eventcore-badges">
      <h2 className="ec-panel-title">Badge print</h2>
      <p className="ec-panel-lead">
        Generate badge codes for confirmed attendees, then open the print layout. Use your browser
        Print → Save as PDF for professional name badges (Avery 5392 / 2×3.375 in).
      </p>
      <div className="flex flex-wrap gap-3 items-center">
        <EnsureBadgeCodesButton orgSlug={orgSlug} eventId={eventId} />
        <Link
          href={`/${orgSlug}/events/${eventId}/badges`}
          className="pc-btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open print view ↗
        </Link>
      </div>
      <p className="mt-4 text-sm text-[var(--readable-on-light-muted)]">
        {badgeReadyCount} of {totalConfirmed} confirmed registrations have badge codes.
      </p>
    </section>
  );
}
