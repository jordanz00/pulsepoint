"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  linkMemberPortalAccount,
  linkMemberPortalByEmail,
  unlinkMemberPortalAccount,
} from "@/app/actions/portal-link";

export function MemberPortalLinkPanel({
  orgSlug,
  memberId,
  memberEmail,
  clerkUserId,
  canWrite,
}: {
  orgSlug: string;
  memberId: string;
  memberEmail: string | null;
  clerkUserId: string | null;
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="ds-card ds-glass committee-section">
      <h2 className="committee-section__title">Member portal access</h2>
      <p className="committee-section__lead">
        Links this roster record to a sign-in so the member can use{" "}
        <Link href={`/${orgSlug}/portal`} className="portal-section__link">
          My portal
        </Link>{" "}
        (renewals, invoices, events). Auto-links on first visit when emails match.
      </p>

      <dl className="portal-link-status">
        <div>
          <dt>Portal linked</dt>
          <dd>{clerkUserId ? "Yes" : "No"}</dd>
        </div>
        {clerkUserId ? (
          <div>
            <dt>Sign-in ID</dt>
            <dd>
              <code className="portal-link-status__code">{clerkUserId}</code>
            </dd>
          </div>
        ) : null}
        {memberEmail ? (
          <div>
            <dt>Member email</dt>
            <dd>{memberEmail}</dd>
          </div>
        ) : null}
      </dl>

      {msg ? <p className="ds-page-subtitle">{msg}</p> : null}

      {canWrite ? (
        <div className="portal-link-actions">
          {!clerkUserId && memberEmail ? (
            <button
              type="button"
              className="ds-btn ds-btn--secondary"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const res = await linkMemberPortalByEmail(orgSlug, memberId);
                  setMsg(
                    res.ok
                      ? "Portal linked by email match."
                      : res.error,
                  );
                });
              }}
            >
              Link by email
            </button>
          ) : null}

          <form
            className="portal-link-manual"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                const res = await linkMemberPortalAccount(orgSlug, {
                  memberId,
                  clerkUserId: String(fd.get("clerkUserId") ?? ""),
                });
                setMsg(res.ok ? "Portal linked." : res.error);
                if (res.ok) e.currentTarget.reset();
              });
            }}
          >
            <input
              name="clerkUserId"
              placeholder="Clerk user ID (manual)"
              className="pc-input"
              required
              maxLength={128}
            />
            <button type="submit" className="ds-btn ds-btn--primary" disabled={pending}>
              Link sign-in
            </button>
          </form>

          {clerkUserId ? (
            <button
              type="button"
              className="ds-btn ds-btn--ghost"
              disabled={pending}
              onClick={() => {
                if (!confirm("Remove portal link for this member?")) return;
                startTransition(async () => {
                  const res = await unlinkMemberPortalAccount(orgSlug, memberId);
                  setMsg(res.ok ? "Portal link removed." : res.error);
                });
              }}
            >
              Unlink portal
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
