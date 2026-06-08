"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateMemberCrmProfile } from "@/app/actions/crm";
import type { EnrichmentSuggestion } from "@/lib/crm/enrichment";
import type { FirmographicProfile } from "@/lib/crm/prospector-enrichment";

export function MemberEnrichmentCard({
  orgSlug,
  memberId,
  suggestions,
  firmographics,
}: {
  orgSlug: string;
  memberId: string;
  suggestions: EnrichmentSuggestion[];
  firmographics?: FirmographicProfile | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function apply(s: EnrichmentSuggestion) {
    setPending(s.field);
    await updateMemberCrmProfile(memberId, { [s.field]: s.value }, orgSlug);
    setPending(null);
    router.refresh();
  }

  const firmographicBlock = firmographics ? (
    <div className="mb-4 rounded-lg border border-[var(--pc-border)] bg-white/80 p-4 text-sm">
      <p className="font-medium text-zinc-900">Prospector firmographics</p>
      <dl className="mt-2 grid gap-1 text-zinc-600">
        <div>
          <span className="text-zinc-500">Industry:</span> {firmographics.industry}
        </div>
        <div>
          <span className="text-zinc-500">Size:</span> {firmographics.employeeCountRange}
        </div>
        <div>
          <span className="text-zinc-500">Revenue:</span> {firmographics.revenueRange}
        </div>
        <div>
          <span className="text-zinc-500">ICP:</span> {firmographics.icpMatch}
        </div>
      </dl>
    </div>
  ) : null;

  if (suggestions.length === 0 && !firmographics) {
    return (
      <section className="pc-glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Contact enrichment</h2>
        <p className="mt-1 text-sm text-zinc-500">Profile looks complete. No suggestions right now.</p>
      </section>
    );
  }

  return (
    <section className="pc-glass-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Unify & enrich</h2>
      {firmographicBlock}
      <p className="mt-1 text-sm text-zinc-500">
        Suggested business and social context — verify before applying (demo enrichment).
      </p>
      <ul className="mt-4 space-y-3">
        {suggestions.map((s) => (
          <li key={s.field} className="rounded-lg border border-zinc-100 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-medium text-zinc-800">
              {s.field}: {s.value}
            </p>
            <p className="text-xs text-zinc-500">
              {s.source} · {s.confidence} confidence
            </p>
            <Button
              type="button"
              className="mt-2"
              disabled={pending === s.field}
              onClick={() => apply(s)}
            >
              {pending === s.field ? "Applying…" : "Apply"}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
