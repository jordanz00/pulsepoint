"use client";

import Link from "next/link";
import { RELATIONSHIP_HEALTH_LABEL } from "@/lib/crm/constants";
import { ContactRecordQuickActions } from "@/components/crm/contact-record/contact-record-quick-actions";
import { ContactRecordTabs } from "@/components/crm/contact-record/contact-record-tabs";
import type { ContactRecordData } from "@/lib/contact-record/types";

export function ContactRecord({
  orgSlug,
  data,
}: {
  orgSlug: string;
  data: ContactRecordData;
}) {
  const m = data.member;

  return (
    <section className="pc-glass-panel overflow-hidden rounded-xl">
      <div className="border-b border-[var(--pc-border)] bg-gradient-to-br from-slate-50 to-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">
              Contact record
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              {m.firstName} {m.lastName}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {m.company || "No company"}
              {m.jobTitle ? ` · ${m.jobTitle}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1 font-medium shadow-sm">
              {RELATIONSHIP_HEALTH_LABEL[m.relationshipHealth] ?? m.relationshipHealth}
            </span>
            {m.nextFollowUpAt ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-900">
                Follow-up {new Date(m.nextFollowUpAt).toLocaleDateString()}
              </span>
            ) : null}
            <span className="rounded-full bg-white px-3 py-1 text-zinc-600 shadow-sm">
              Engagement {m.engagementScore}
            </span>
          </div>
        </div>

        {data.profile360 ? (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>{data.profile360.totals.events} events</span>
            <span>{data.profile360.totals.orders} orders</span>
            <span>
              ${(data.profile360.totals.donationsCents / 100).toLocaleString()} giving
            </span>
            <span>{data.profile360.totals.ceCredits} CE credits</span>
          </div>
        ) : null}
      </div>

      <div className="border-b border-[var(--pc-border)] px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Quick actions
        </p>
        <ContactRecordQuickActions orgSlug={orgSlug} memberId={m.id} data={data} />
      </div>

      <div className="px-6 pb-6">
        <ContactRecordTabs orgSlug={orgSlug} memberId={m.id} data={data} />
      </div>

      <div className="border-t border-[var(--pc-border)] bg-zinc-50/80 px-6 py-3 text-xs text-zinc-500">
        Last touch:{" "}
        {m.lastTouchAt ? new Date(m.lastTouchAt).toLocaleString() : "Never"} ·{" "}
        <Link href={`/${orgSlug}/crm/prospector`} className="text-[var(--pc-brand)]">
          Open Prospector
        </Link>
      </div>
    </section>
  );
}
