"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  enrichProspectForStaff,
  lookupProspect,
  getMemberProspectContext,
  applyProspectEnrichment,
  prospectorQuickNote,
  prospectorStayInTouch,
} from "@/app/actions/prospector";
import type { FirmographicProfile } from "@/lib/crm/prospector-enrichment";

const ICP_COLOR = {
  strong: "text-green-700 bg-green-50",
  moderate: "text-amber-800 bg-amber-50",
  weak: "text-zinc-600 bg-zinc-100",
};

export function ProspectorPanel({
  orgSlug,
  orgId,
  initialEmail,
}: {
  orgSlug: string;
  orgId: string;
  initialEmail?: string;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [company, setCompany] = useState("");
  const [firmographics, setFirmographics] = useState<FirmographicProfile | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [context, setContext] = useState<Awaited<ReturnType<typeof getMemberProspectContext>>["data"] | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lookup() {
    startTransition(async () => {
      setMsg(null);
      const res = await lookupProspect(orgSlug, { email: email || undefined });
      if (!res.ok || !res.data) {
        setMsg(!res.ok ? res.error ?? "Lookup failed" : "Lookup failed");
        return;
      }
      const data = res.data;
      setFirmographics(data.firmographics);
      setMemberId(data.member?.id ?? null);
      setProfileUrl(data.member?.profileUrl ?? null);
      if (data.member?.id) {
        const ctx = await getMemberProspectContext(orgSlug, data.member.id);
        if (ctx.ok) setContext(ctx.data);
      } else {
        setContext(null);
      }
    });
  }

  function enrichOnly() {
    startTransition(async () => {
      const res = await enrichProspectForStaff(orgSlug, { email, company });
      if (res.ok && res.data) {
        setFirmographics(res.data.firmographics);
        setMsg("Enrichment ready — save to a member after capture.");
      } else setMsg(!res.ok ? res.error ?? "Failed" : "Failed");
    });
  }

  return (
    <div className="space-y-6">
      <div className="pc-card p-4">
        <h2 className="pc-section-title">Prospect & enrich</h2>
        <p className="pc-section-lead mt-1">
          Build enriched records from email or company — firmographics, ICP fit, and CRM match.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-zinc-500">Email</span>
            <input
              className="pc-input min-w-[14rem]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@hospital.org"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-zinc-500">Company (optional)</span>
            <input
              className="pc-input min-w-[14rem]"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Health System"
            />
          </label>
          <button type="button" className="pc-btn-primary text-sm" disabled={pending} onClick={lookup}>
            Look up
          </button>
          <button type="button" className="pc-btn-secondary text-sm" disabled={pending} onClick={enrichOnly}>
            Enrich only
          </button>
        </div>
      </div>

      {firmographics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="pc-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-zinc-900">Business insights</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${ICP_COLOR[firmographics.icpMatch]}`}
              >
                ICP {firmographics.icpMatch}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Company</dt>
                <dd className="font-medium">{firmographics.companyName}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Industry</dt>
                <dd>{firmographics.industry}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Size</dt>
                <dd>{firmographics.employeeCountRange} employees</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Revenue</dt>
                <dd>{firmographics.revenueRange}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">HQ</dt>
                <dd>{firmographics.headquarters}</dd>
              </div>
              {firmographics.leadershipHint ? (
                <div>
                  <dt className="text-zinc-500">Leadership</dt>
                  <dd>{firmographics.leadershipHint}</dd>
                </div>
              ) : null}
            </dl>
            <ul className="mt-3 list-disc pl-5 text-xs text-zinc-600">
              {firmographics.icpReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {memberId ? (
              <button
                type="button"
                className="pc-btn-secondary mt-4 text-xs"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await applyProspectEnrichment(orgSlug, memberId, firmographics);
                    setMsg(res.ok ? "Saved enrichment to member." : res.error ?? "Failed");
                  })
                }
              >
                Save enrichment to member
              </button>
            ) : null}
          </div>

          <div className="pc-card p-4">
            <h3 className="font-semibold text-zinc-900">Prepare for interaction</h3>
            {profileUrl ? (
              <p className="mt-2 text-sm">
                <Link href={profileUrl} className="font-medium text-[var(--pc-brand)]">
                  Open full member profile →
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">
                No CRM match — use capture API or add from directory.
              </p>
            )}

            {context ? (
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <span className="text-zinc-500">Health:</span> {context.member.relationshipHealth}
                  {context.member.nextFollowUpAt ? (
                    <>
                      {" "}
                      · <span className="text-zinc-500">Follow-up:</span>{" "}
                      {new Date(context.member.nextFollowUpAt).toLocaleDateString()}
                    </>
                  ) : null}
                </p>
                {context.notes.length > 0 ? (
                  <div>
                    <p className="font-medium text-zinc-700">Recent notes</p>
                    <ul className="mt-1 space-y-1">
                      {context.notes.slice(0, 4).map((n) => (
                        <li key={n.id} className="text-zinc-600">
                          {n.body.slice(0, 120)}
                          {n.body.length > 120 ? "…" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {context.workflows.length > 0 ? (
                  <p className="text-zinc-600">Workflows: {context.workflows.join(", ")}</p>
                ) : null}
              </div>
            ) : null}

            {memberId ? (
              <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
                <p className="text-sm font-medium text-zinc-700">Quick actions</p>
                <textarea
                  className="pc-input w-full text-sm"
                  rows={2}
                  placeholder="Log a note from this page…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="pc-btn-primary text-xs"
                    disabled={pending || !note.trim()}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await prospectorQuickNote(orgSlug, {
                          memberId,
                          body: note,
                          channel: "prospector",
                        });
                        setMsg(res.ok ? "Note logged." : res.error ?? "Failed");
                        if (res.ok) setNote("");
                      })
                    }
                  >
                    Log note
                  </button>
                  {(["7d", "30d", "90d"] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      className="pc-btn-secondary text-xs"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await prospectorStayInTouch(orgSlug, { memberId, when: w });
                          setMsg(res.ok ? `Stay in touch: ${w}` : res.error ?? "Failed");
                        })
                      }
                    >
                      Stay in touch {w}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {msg ? <p className="text-sm text-zinc-600">{msg}</p> : null}

      <p className="text-xs text-zinc-400">
        Extension API org: <code>{orgId}</code> · Endpoints under{" "}
        <code>/api/crm/prospect/*</code>
      </p>
    </div>
  );
}
