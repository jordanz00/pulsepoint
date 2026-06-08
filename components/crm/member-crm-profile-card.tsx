"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateMemberCrmProfile } from "@/app/actions/crm";
import { RELATIONSHIP_HEALTH_LABEL } from "@/lib/crm/constants";

type Props = {
  orgSlug: string;
  memberId: string;
  initial: {
    company: string | null;
    jobTitle: string | null;
    linkedInUrl: string | null;
    websiteUrl: string | null;
    relationshipHealth: string;
    nextFollowUpAt: Date | null;
  };
};

export function MemberCrmProfileCard({ orgSlug, memberId, initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const result = await updateMemberCrmProfile(
      memberId,
      {
        company: String(fd.get("company") ?? ""),
        jobTitle: String(fd.get("jobTitle") ?? ""),
        linkedInUrl: String(fd.get("linkedInUrl") ?? ""),
        websiteUrl: String(fd.get("websiteUrl") ?? ""),
        relationshipHealth: String(fd.get("relationshipHealth") ?? "STEADY"),
        nextFollowUpAt: String(fd.get("nextFollowUpAt") ?? ""),
      },
      orgSlug,
    );
    setPending(false);
    setMsg(result.ok ? "Saved." : result.error ?? "Error");
    if (result.ok) router.refresh();
  }

  return (
    <section className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Relationship profile</h2>
      <p className="mt-1 text-sm text-zinc-500">
        People-first context — nurture the relationship, not just the transaction.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Company
          <input
            name="company"
            defaultValue={initial.company ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Title
          <input
            name="jobTitle"
            defaultValue={initial.jobTitle ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          LinkedIn
          <input
            name="linkedInUrl"
            defaultValue={initial.linkedInUrl ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Relationship health
          <select
            name="relationshipHealth"
            defaultValue={initial.relationshipHealth}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
          >
            {Object.entries(RELATIONSHIP_HEALTH_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Next follow-up
          <input
            name="nextFollowUpAt"
            type="datetime-local"
            defaultValue={
              initial.nextFollowUpAt
                ? new Date(initial.nextFollowUpAt).toISOString().slice(0, 16)
                : ""
            }
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save relationship profile"}
          </Button>
          {msg ? <p className="mt-2 text-sm text-zinc-600">{msg}</p> : null}
        </div>
      </form>
    </section>
  );
}
