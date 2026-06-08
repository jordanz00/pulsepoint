import Link from "next/link";
import { workforceTrackLabel } from "@/lib/learn/video-embed";
import { MemberTranscriptExportButton } from "@/components/members/member-transcript-export-button";

type EnrollmentRow = {
  programTitle: string;
  status: string;
};

type SuggestedPlaylist = {
  trackSlug: string;
  title: string;
  itemCount: number;
};

const PERSONA_TRACK: Record<string, string> = {
  STUDENT: "nursing",
  NEW_GRAD: "nursing",
  CAREER_CHANGER: "allied-health",
  EXPERIENCED: "physician",
  EMPLOYER_PARTNER: "general",
};

export function MemberWorkforceLearnPanel({
  orgSlug,
  memberId,
  memberName,
  canExportTranscript,
  workforcePersona,
  enrollments,
  suggestedPlaylists,
}: {
  orgSlug: string;
  memberId: string;
  memberName: string;
  canExportTranscript: boolean;
  workforcePersona: string;
  enrollments: EnrollmentRow[];
  suggestedPlaylists: SuggestedPlaylist[];
}) {
  const track = PERSONA_TRACK[workforcePersona] ?? "general";

  return (
    <section className="glass pp-glass-surface p-5 mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="pc-section-title">Workforce & Learn</h2>
          <p className="text-sm text-[var(--pc-text-secondary)] mt-1">
            Pipeline programs and suggested video tracks — alpha.
          </p>
        </div>
        <span className="badge-alpha">Alpha</span>
      </div>

      <p className="text-sm mt-4">
        Persona: <strong>{workforcePersona.replace(/_/g, " ").toLowerCase()}</strong>
        {workforcePersona !== "NONE" ? (
          <> · suggested track: {workforceTrackLabel(track)}</>
        ) : null}
      </p>

      {enrollments.length > 0 ? (
        <ul className="pc-simple-list mt-4">
          {enrollments.map((e, i) => (
            <li key={i} className="px-5 py-3 text-sm">
              {e.programTitle} · {e.status}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 mt-3">No workforce program enrollments yet.</p>
      )}

      {suggestedPlaylists.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {suggestedPlaylists.map((p) => (
            <li key={p.trackSlug}>
              {p.title} ({p.itemCount} videos) — {workforceTrackLabel(p.trackSlug)}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canExportTranscript ? (
          <MemberTranscriptExportButton
            orgSlug={orgSlug}
            memberId={memberId}
            memberName={memberName}
          />
        ) : null}
        <Link href={`/${orgSlug}/learn/library`} className="pc-btn-secondary text-sm">
          Open video library
        </Link>
        <Link href={`/${orgSlug}/learn/workforce`} className="pc-btn-secondary text-sm">
          Workforce admin
        </Link>
      </div>
    </section>
  );
}
