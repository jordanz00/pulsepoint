"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addMemberNote } from "@/app/actions/member-notes";

type Note = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string | null;
};

export function MemberNotes({
  orgSlug,
  memberId,
  initialNotes,
  variant = "full",
  maxVisible = 3,
}: {
  orgSlug: string;
  memberId: string;
  initialNotes: Note[];
  /** Compact: summary one-screen — fewer notes, shorter form */
  variant?: "full" | "compact";
  maxVisible?: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const compact = variant === "compact";
  const visibleNotes = compact ? initialNotes.slice(0, maxVisible) : initialNotes;

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const body = String(formData.get("body") ?? "");
    const noteType = String(formData.get("noteType") ?? "RELATIONSHIP") as
      | "RELATIONSHIP"
      | "FOLLOW_UP"
      | "GENERAL";
    const channel = String(formData.get("channel") ?? "");
    const nextFollowUpAt = String(formData.get("nextFollowUpAt") ?? "");
    const result = await addMemberNote(
      memberId,
      {
        body,
        noteType,
        channel: compact ? "other" : channel,
        nextFollowUpAt: nextFollowUpAt || undefined,
      },
      orgSlug,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save note");
      return;
    }
    router.refresh();
  }

  return (
    <section
      className={`pp-readable-on-light mc-profile-notes${compact ? " mc-profile-notes--compact" : ""}`}
    >
      <h2 className="mc-profile-card-title">
        {compact ? "Recent notes" : "Relationship notes"}
      </h2>
      <p className="mc-profile-lead">
        {compact
          ? "Staff touchpoints — add a note without leaving the summary."
          : "Nurture the relationship — log calls, meetings, and follow-ups. Updates last touch and optional next follow-up date."}
      </p>

      {visibleNotes.length === 0 ? (
        <p className="mc-profile-empty">No notes yet — log your first touch below.</p>
      ) : (
        <ul className="mc-profile-notes-list">
          {visibleNotes.map((n) => (
            <li key={n.id} className="mc-profile-note-item">
              <p className="mc-profile-note-body">{n.body}</p>
              <p className="mc-profile-note-meta">
                {n.authorName ?? "Staff"} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form action={onSubmit} className="mc-profile-notes-form">
        {!compact ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="mc-field-label">
              Type
              <select name="noteType" className="mc-input">
                <option value="RELATIONSHIP">Relationship</option>
                <option value="FOLLOW_UP">Follow-up</option>
                <option value="GENERAL">General</option>
              </select>
            </label>
            <label className="mc-field-label">
              Channel
              <select name="channel" className="mc-input">
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="linkedin">LinkedIn</option>
                <option value="in_person">In person</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="mc-field-label">
              Next follow-up
              <input name="nextFollowUpAt" type="datetime-local" className="mc-input" />
            </label>
          </div>
        ) : (
          <>
            <input type="hidden" name="noteType" value="RELATIONSHIP" />
            <input type="hidden" name="channel" value="other" />
          </>
        )}
        <label className="mc-field-label">
          Note
          <textarea
            name="body"
            required
            maxLength={5000}
            rows={compact ? 3 : 4}
            placeholder="What mattered in this touch — context for the next conversation…"
            className="mc-input"
          />
        </label>
        {error ? (
          <p className="mc-profile-notes-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="min-h-11">
          {pending ? "Saving…" : "Add note"}
        </Button>
      </form>
    </section>
  );
}
