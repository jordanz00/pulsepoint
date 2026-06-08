"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Member360Timeline } from "@/components/members/member-360-timeline";
import { InlineField } from "@/components/crm/contact-record/inline-field";
import { CONTACT_RECORD_TABS, type ContactRecordData, type ContactRecordTab } from "@/lib/contact-record/types";
import { RELATIONSHIP_HEALTH_LABEL } from "@/lib/crm/constants";
import { applyProspectEnrichment } from "@/app/actions/prospector";
import type { FirmographicProfile } from "@/lib/crm/prospector-enrichment";

export function ContactRecordTabs({
  orgSlug,
  memberId,
  data,
}: {
  orgSlug: string;
  memberId: string;
  data: ContactRecordData;
}) {
  const [tab, setTab] = useState<ContactRecordTab>("interactions");

  return (
    <div>
      <nav className="flex gap-1 overflow-x-auto border-b border-[var(--pc-border)]">
        {CONTACT_RECORD_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-[var(--pc-brand)] text-[var(--pc-brand)]"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="py-6">
        {tab === "interactions" ? <InteractionsTab orgSlug={orgSlug} memberId={memberId} data={data} /> : null}
        {tab === "data" ? <DataFieldsTab orgSlug={orgSlug} memberId={memberId} data={data} /> : null}
        {tab === "company" ? (
          <CompanyTab orgSlug={orgSlug} memberId={memberId} firmographics={data.firmographics} />
        ) : null}
        {tab === "social" ? <SocialTab data={data} /> : null}
        {tab === "integrations" ? <IntegrationsTab data={data} orgSlug={orgSlug} /> : null}
        {tab === "files" ? <FilesTab /> : null}
      </div>
    </div>
  );
}

function InteractionsTab({
  orgSlug,
  data,
}: {
  orgSlug: string;
  memberId: string;
  data: ContactRecordData;
}) {
  const upcoming = data.member.nextFollowUpAt;
  const isFuture = upcoming && upcoming.getTime() > Date.now();

  return (
    <div className="space-y-6">
      {isFuture ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <strong>Upcoming:</strong> Stay in touch{" "}
          {new Date(upcoming).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      ) : null}

      {data.deals.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-zinc-900">Partnerships</h3>
          <ul className="mt-2 space-y-2">
            {data.deals.map((d) => (
              <li key={d.id} className="rounded-lg border border-[var(--pc-border)] px-3 py-2 text-sm">
                <Link href={`/${orgSlug}/deals/pipeline`} className="font-medium text-[var(--pc-brand)]">
                  {d.title}
                </Link>
                <span className="text-zinc-500">
                  {" "}
                  · {d.stage} · ${(d.amountCents / 100).toLocaleString()} · {d.pipelineName}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.workflowRuns.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-zinc-900">Active workflows</h3>
          <ul className="mt-2 space-y-2">
            {data.workflowRuns.map((w) => (
              <li key={w.id} className="text-sm">
                <Link
                  href={`/${orgSlug}/crm/workflows/${w.workflowId}`}
                  className="font-medium text-[var(--pc-brand)]"
                >
                  {w.workflowName}
                </Link>
                <span className="text-zinc-500"> · {w.stageLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h3 className="text-sm font-semibold text-zinc-900">Notes & activity</h3>
        <ul className="mt-2 space-y-2">
          {data.notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-[var(--pc-border)] px-3 py-2 text-sm">
              <p className="text-zinc-800">{n.body}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {n.authorName ?? "Staff"}
                {n.channel ? ` · ${n.channel}` : ""} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {data.profile360 ? (
        <section>
          <h3 className="text-sm font-semibold text-zinc-900">Cross-module timeline</h3>
          <div className="mt-3">
            <Member360Timeline activities={data.profile360.activities} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DataFieldsTab({
  orgSlug,
  memberId,
  data,
}: {
  orgSlug: string;
  memberId: string;
  data: ContactRecordData;
}) {
  const m = data.member;
  const healthOptions = Object.entries(RELATIONSHIP_HEALTH_LABEL).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Click any field to edit inline — no need to leave this page.</p>
      <dl className="grid gap-1 sm:grid-cols-2">
        <InlineField orgSlug={orgSlug} memberId={memberId} field="firstName" label="First name" value={m.firstName} />
        <InlineField orgSlug={orgSlug} memberId={memberId} field="lastName" label="Last name" value={m.lastName} />
        <InlineField orgSlug={orgSlug} memberId={memberId} field="email" label="Email" value={m.email ?? ""} type="email" />
        <InlineField orgSlug={orgSlug} memberId={memberId} field="phone" label="Phone" value={m.phone ?? ""} />
        <InlineField orgSlug={orgSlug} memberId={memberId} field="company" label="Company" value={m.company ?? ""} />
        <InlineField orgSlug={orgSlug} memberId={memberId} field="jobTitle" label="Title" value={m.jobTitle ?? ""} />
        <InlineField
          orgSlug={orgSlug}
          memberId={memberId}
          field="relationshipHealth"
          label="Relationship health"
          value={m.relationshipHealth}
          type="select"
          options={healthOptions}
        />
      </dl>
      {data.tags.length > 0 ? (
        <p className="text-sm text-zinc-600">
          <span className="text-zinc-500">Tags:</span> {data.tags.join(", ")}
        </p>
      ) : null}
      {data.relationships.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold">Relationships</h3>
          <ul className="mt-2 text-sm text-zinc-600">
            {data.relationships.map((r) => (
              <li key={r.id}>
                <Link href={`/${orgSlug}/members/${r.otherMemberId}`} className="text-[var(--pc-brand)]">
                  {r.label}
                </Link>{" "}
                · {r.relationType}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CompanyTab({
  orgSlug,
  memberId,
  firmographics,
}: {
  orgSlug: string;
  memberId: string;
  firmographics: FirmographicProfile | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!firmographics) {
    return (
      <p className="text-sm text-zinc-500">
        No company insights yet. Use Prospector or web capture to enrich this contact.
      </p>
    );
  }

  const f = firmographics;

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-zinc-500">Company</dt>
          <dd className="font-medium">{f.companyName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Industry</dt>
          <dd>{f.industry}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Employees</dt>
          <dd>{f.employeeCountRange}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Revenue</dt>
          <dd>{f.revenueRange}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Headquarters</dt>
          <dd>{f.headquarters}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">ICP fit</dt>
          <dd className="capitalize">{f.icpMatch}</dd>
        </div>
      </dl>
      <ul className="list-disc pl-5 text-sm text-zinc-600">
        {f.icpReasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <button
        type="button"
        className="pc-btn-secondary text-sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await applyProspectEnrichment(orgSlug, memberId, f);
            router.refresh();
          })
        }
      >
        Refresh saved enrichment
      </button>
    </div>
  );
}

function SocialTab({ data }: { data: ContactRecordData }) {
  const m = data.member;
  const links = [
    { label: "LinkedIn", url: m.linkedInUrl },
    { label: "Website", url: m.websiteUrl },
    ...(data.firmographics?.socialProfiles.twitter
      ? [{ label: "Twitter", url: data.firmographics.socialProfiles.twitter }]
      : []),
  ].filter((l) => l.url);

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Digital footprint — edit URLs in Data fields tab.</p>
      {links.length === 0 ? (
        <p className="text-sm text-zinc-400">No social links on file.</p>
      ) : (
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--pc-brand)]"
              >
                {l.label} →
              </a>
            </li>
          ))}
        </ul>
      )}
      {data.sources.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold">Capture sources</h3>
          <ul className="mt-2 text-sm text-zinc-600">
            {data.sources.map((s) => (
              <li key={s.id}>
                {s.label} · {s.sourceKind} · {new Date(s.capturedAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function IntegrationsTab({ data, orgSlug }: { data: ContactRecordData; orgSlug: string }) {
  const q = encodeURIComponent(data.member.company ?? `${data.member.firstName} ${data.member.lastName}`);
  const lookups = [
    { label: "LinkedIn search", href: `https://www.linkedin.com/search/results/people/?keywords=${q}` },
    { label: "Google", href: `https://www.google.com/search?q=${q}` },
    { label: "PulsePoint Prospector", href: `/${orgSlug}/crm/prospector/panel?email=${encodeURIComponent(data.member.email ?? "")}` },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Quick lookups — full embed integrations (Office 365, Drive) are on the roadmap.
      </p>
      <ul className="space-y-2">
        {lookups.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--pc-brand)]">
              {l.label} →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilesTab() {
  return (
    <p className="text-sm text-zinc-500">
      File attachments from OneDrive, Google Drive, and Dropbox will appear here when IT connects
      document storage. For now, attach context in notes on the Interactions tab.
    </p>
  );
}
