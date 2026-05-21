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
}: {
  orgSlug: string;
  memberId: string;
  initialNotes: Note[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const body = String(formData.get("body") ?? "");
    const result = await addMemberNote(memberId, { body }, orgSlug);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save note");
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Staff notes</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Canonical interaction history for this member — use notes here, not ad-hoc
        spreadsheets or custom fields.
      </p>

      {initialNotes.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {initialNotes.map((n) => (
            <li key={n.id} className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <p className="whitespace-pre-wrap text-zinc-800">{n.body}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {n.authorName ?? "Staff"} ·{" "}
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form action={onSubmit} className="mt-6 space-y-3">
        <textarea
          name="body"
          required
          maxLength={5000}
          rows={4}
          placeholder="Call summary, renewal discussion, internal context…"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add note"}
        </Button>
      </form>
    </section>
  );
}
