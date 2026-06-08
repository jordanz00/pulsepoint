"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createAdvocacyIssueFromTemplate,
  deleteAdvocacyIssue,
  updateAdvocacyIssue,
} from "@/app/actions/advocacy";
import {
  ADVOCACY_ISSUE_TEMPLATES,
  issueAreaLabel,
  type AdvocacyIssueAreaId,
} from "@/lib/advocacy/issue-templates";
import { resolveToolkitPath } from "@/lib/advocacy/issue-media";

type IssueRow = {
  id: string;
  title: string;
  summary: string;
  status: string;
  issueArea: string;
  publicSlug: string | null;
  billNumber: string | null;
};

export function AdvocacyIssueHub({
  orgSlug,
  issues,
}: {
  orgSlug: string;
  issues: IssueRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingSlugs = new Set(issues.map((i) => i.publicSlug).filter(Boolean));

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) setMessage("Saved.");
      else setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="space-y-6">
      <section className="pp-advocacy-panel glass pp-glass-surface p-5">
        <h2 className="pc-section-title">Healthcare issue templates</h2>
        <p className="pp-advocacy-actions-lead">
          Alpha templates with illustrative copy — SME review required before public advocacy claims.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 mt-4">
          {ADVOCACY_ISSUE_TEMPLATES.map((t) => {
            const added = existingSlugs.has(t.slug);
            return (
              <li key={t.slug} className="pp-advocacy-template-card glass pp-glass-surface p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {issueAreaLabel(t.area)}
                </p>
                <h3 className="font-medium text-[var(--pc-text)] mt-1">{t.title}</h3>
                <p className="text-sm text-[var(--pc-text-secondary)] mt-2 line-clamp-3">
                  {t.summary}
                </p>
                <p className="text-xs text-zinc-500 mt-2 flex flex-wrap gap-2">
                  {t.heroVideoUrl ? <span className="badge-alpha">Hero video</span> : null}
                  {t.heroImageUrl ? <span className="badge-alpha">Hero image</span> : null}
                  {resolveToolkitPath(t.toolkitPath) ? (
                    <span className="badge-alpha">Toolkit PDF</span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {added ? (
                    <>
                      <span className="badge-alpha">Added</span>
                      <Link
                        href={`/${orgSlug}/advocacy/issues/${t.slug}`}
                        className="pc-btn-secondary text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Member page
                      </Link>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="pc-btn-primary text-sm"
                      disabled={pending}
                      onClick={() =>
                        run(() => createAdvocacyIssueFromTemplate(orgSlug, { templateSlug: t.slug }))
                      }
                    >
                      Add from template
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="pp-advocacy-panel glass pp-glass-surface p-5">
        <h2 className="pc-section-title">Your issue hub ({issues.length})</h2>
        {issues.length === 0 ? (
          <p className="text-sm text-zinc-500 mt-2">Add a template above or create issues on the main advocacy page.</p>
        ) : (
          <ul className="mk-adv-preview-issue-list mt-4 space-y-3">
            {issues.map((i) => (
              <li key={i.id} className="pp-advocacy-issue-row glass pp-glass-surface p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="text-xs text-zinc-500">
                      {issueAreaLabel(i.issueArea as AdvocacyIssueAreaId)} · {i.status}
                    </p>
                    <p className="font-medium">{i.title}</p>
                    {i.publicSlug ? (
                      <Link
                        href={`/${orgSlug}/advocacy/issues/${i.publicSlug}`}
                        className="text-sm text-[var(--pc-brand)] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        /advocacy/issues/{i.publicSlug}
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="pc-btn-secondary text-sm"
                      disabled={pending}
                      onClick={() =>
                        run(() =>
                          updateAdvocacyIssue(orgSlug, {
                            issueId: i.id,
                            status: i.status === "ACTIVE" ? "TRACKING" : "ACTIVE",
                          }),
                        )
                      }
                    >
                      {i.status === "ACTIVE" ? "Set tracking" : "Set active"}
                    </button>
                    <button
                      type="button"
                      className="pc-btn-secondary text-sm"
                      disabled={pending}
                      onClick={() => run(() => deleteAdvocacyIssue(orgSlug, { issueId: i.id }))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  );
}
