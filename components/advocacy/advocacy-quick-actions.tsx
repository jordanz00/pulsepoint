"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createAdvocacyCampaign,
  createAdvocacyIssue,
  launchAdvocacyTakeAction,
  recordAdvocacyResponse,
} from "@/app/actions/advocacy";
import { CopyTakeActionLink } from "@/components/advocacy/copy-take-action-link";
import { engageAudienceUrl } from "@/lib/engage/audience-url";
import { publicTakeActionUrl } from "@/lib/advocacy/public-take-action-url";

type IssueOption = { id: string; title: string };

export function AdvocacyQuickActions({
  orgSlug,
  issues,
  campaigns,
}: {
  orgSlug: string;
  issues: IssueOption[];
  campaigns: Array<{
    id: string;
    name: string;
    audienceId: string | null;
    responseCount: number;
    targetCount: number;
  }>;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setMessage("Saved.");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <section className="pp-advocacy-actions glass pp-glass-surface p-5" aria-label="Advocacy actions">
      <h2 className="pc-section-title">Take action</h2>
      <p className="pp-advocacy-actions-lead">
        Add a priority issue, start a campaign, then launch an Engage audience for your active member roster.
      </p>

      <div className="pp-advocacy-actions-grid">
        <form
          className="pp-advocacy-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() =>
              createAdvocacyIssue(orgSlug, {
                title: String(fd.get("title") ?? ""),
                summary: String(fd.get("summary") ?? ""),
                jurisdiction: String(fd.get("jurisdiction") ?? "STATE"),
                billNumber: String(fd.get("billNumber") ?? ""),
                status: "TRACKING",
              }),
            );
            e.currentTarget.reset();
          }}
        >
          <h3 className="pp-advocacy-form-title">Add priority issue</h3>
          <label className="mc-field-label">
            Title
            <input name="title" required maxLength={200} className="mc-input" placeholder="340B program protections" />
          </label>
          <label className="mc-field-label">
            Summary
            <textarea name="summary" rows={2} className="mc-input" placeholder="Why this matters for member hospitals" />
          </label>
          <div className="pp-advocacy-form-row">
            <label className="mc-field-label">
              Jurisdiction
              <select name="jurisdiction" className="mc-input" defaultValue="STATE">
                <option value="STATE">State</option>
                <option value="FEDERAL">Federal</option>
                <option value="BOTH">Both</option>
              </select>
            </label>
            <label className="mc-field-label">
              Bill number
              <input name="billNumber" className="mc-input" placeholder="H.B. 1234" />
            </label>
          </div>
          <button type="submit" className="pc-btn-primary" disabled={pending}>
            Add issue
          </button>
        </form>

        <form
          className="pp-advocacy-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const issueId = String(fd.get("issueId") ?? "");
            run(() =>
              createAdvocacyCampaign(orgSlug, {
                name: String(fd.get("name") ?? ""),
                issueId: issueId || undefined,
              }),
            );
            e.currentTarget.reset();
          }}
        >
          <h3 className="pp-advocacy-form-title">Start campaign</h3>
          <label className="mc-field-label">
            Campaign name
            <input name="name" required maxLength={160} className="mc-input" placeholder="Spring hospital sign-on" />
          </label>
          <label className="mc-field-label">
            Linked issue
            <select name="issueId" className="mc-input" defaultValue="">
              <option value="">Optional</option>
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="pc-btn-secondary" disabled={pending}>
            Create campaign
          </button>
        </form>

        <div className="pp-advocacy-form">
          <h3 className="pp-advocacy-form-title">Launch outreach</h3>
          <p className="pp-advocacy-form-hint">
            Creates an Engage audience for active members. Send email from Engage when your template is ready.
          </p>
          <ul className="pp-advocacy-launch-list">
            {campaigns.map((c) => (
              <li key={c.id} className="pp-advocacy-launch-row">
                <span className="pp-advocacy-launch-name">{c.name}</span>
                <span className="pp-advocacy-launch-actions">
                  {c.audienceId ? (
                    <>
                      <span className="badge-alpha">Launched</span>
                      <CopyTakeActionLink orgSlug={orgSlug} campaignId={c.id} />
                      <Link
                        href={engageAudienceUrl(orgSlug, c.audienceId!)}
                        className="pc-btn-secondary text-sm"
                      >
                        Engage
                      </Link>
                      <Link
                        href={publicTakeActionUrl(orgSlug, c.id)}
                        className="pc-btn-secondary text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Preview form
                      </Link>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="pc-btn-primary text-sm"
                      disabled={pending}
                      onClick={() =>
                        run(() => launchAdvocacyTakeAction(orgSlug, { campaignId: c.id }))
                      }
                    >
                      Launch
                    </button>
                  )}
                  <button
                    type="button"
                    className="pc-btn-secondary text-sm"
                    disabled={pending}
                    title="Record hospital response (staff alpha)"
                    onClick={() =>
                      run(() => recordAdvocacyResponse(orgSlug, { campaignId: c.id, increment: 1 }))
                    }
                  >
                    +1 response
                  </button>
                </span>
              </li>
            ))}
            {campaigns.length === 0 ? (
              <li className="text-sm text-zinc-500">Create a campaign first.</li>
            ) : null}
          </ul>
        </div>
      </div>

      {message ? (
        <p className="pp-advocacy-actions-msg pp-advocacy-actions-msg--ok" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="pp-advocacy-actions-msg pp-advocacy-actions-msg--err" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
