"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { addMemberRelationship } from "@/app/actions/crm";
import { MEMBER_RELATION_LABEL } from "@/lib/crm/constants";

type Rel = {
  id: string;
  relationType: string;
  strength: number;
  fromMember: { id: string; firstName: string; lastName: string };
  toMember: { id: string; firstName: string; lastName: string };
};

export function MemberRelationshipPanel({
  orgSlug,
  memberId,
  relationships,
  memberOptions,
}: {
  orgSlug: string;
  memberId: string;
  relationships: Rel[];
  memberOptions: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await addMemberRelationship(
      memberId,
      {
        toMemberId: String(fd.get("toMemberId")),
        relationType: String(fd.get("relationType")),
        strength: Number(fd.get("strength")),
        notes: String(fd.get("notes") ?? ""),
      },
      orgSlug,
    );
    setPending(false);
    router.refresh();
  }

  return (
    <section className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Relationship map</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Link people to people — colleagues, mentors, board peers, referrals.
      </p>

      {relationships.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No relationships logged yet.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {relationships.map((r) => {
            const other =
              r.fromMember.id === memberId ? r.toMember : r.fromMember;
            return (
              <li key={r.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <Link href={`/${orgSlug}/members/${other.id}`} className="font-medium text-[var(--pc-brand)]">
                  {other.firstName} {other.lastName}
                </Link>
                <span className="text-zinc-500">
                  {" "}
                  · {MEMBER_RELATION_LABEL[r.relationType] ?? r.relationType} · strength {r.strength}/5
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 border-t border-zinc-100 pt-4">
        <label className="text-sm">
          Connect to
          <select name="toMemberId" required className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="">Select member…</option>
            {memberOptions
              .filter((m) => m.id !== memberId)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm">
          Relationship
          <select name="relationType" className="mt-1 w-full rounded-lg border px-3 py-2">
            {Object.entries(MEMBER_RELATION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Strength (1–5)
          <input name="strength" type="number" min={1} max={5} defaultValue={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="text-sm">
          Notes
          <input name="notes" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add relationship"}
        </Button>
      </form>
    </section>
  );
}
