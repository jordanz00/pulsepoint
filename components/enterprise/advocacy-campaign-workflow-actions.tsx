"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  closeAdvocacyCampaign,
  launchAdvocacyTakeAction,
  pauseAdvocacyCampaign,
  recordAdvocacyResponse,
  resumeAdvocacyCampaign,
} from "@/app/actions/advocacy";
import { CopyTakeActionLink } from "@/components/advocacy/copy-take-action-link";
import { AdvocacyCampaignStatusBadge } from "@/components/enterprise/advocacy-campaign-os";
import {
  deriveAdvocacyCampaignLifecycle,
  type AdvocacyCampaignRecord,
} from "@/lib/advocacy-campaign-ops";
import { engageAudienceUrl } from "@/lib/engage/audience-url";
import { publicTakeActionUrl } from "@/lib/advocacy/public-take-action-url";

export function AdvocacyCampaignWorkflowActions({
  orgSlug,
  campaign,
}: {
  orgSlug: string;
  campaign: AdvocacyCampaignRecord;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lifecycle = deriveAdvocacyCampaignLifecycle(campaign);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) setMessage("Updated.");
      else setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <section className="pp-campaign-os__actions glass pp-glass-surface" aria-label="Campaign actions">
      <div className="pp-campaign-os__actions-head">
        <h2 className="pc-section-title">Workflow actions</h2>
        <AdvocacyCampaignStatusBadge campaign={campaign} />
      </div>

      <div className="pp-campaign-os__actions-grid">
        {lifecycle === "draft" ? (
          <button
            type="button"
            className="pc-btn-primary"
            disabled={pending}
            onClick={() => run(() => launchAdvocacyTakeAction(orgSlug, { campaignId: campaign.id }))}
          >
            Launch take-action
          </button>
        ) : null}

        {campaign.audienceId ? (
          <>
            <CopyTakeActionLink orgSlug={orgSlug} campaignId={campaign.id} />
            <Link
              href={publicTakeActionUrl(orgSlug, campaign.id)}
              className="pc-btn-secondary text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview public form
            </Link>
            <Link
              href={engageAudienceUrl(orgSlug, campaign.audienceId)}
              className="pc-btn-secondary text-sm"
            >
              Open Engage audience
            </Link>
          </>
        ) : null}

        {lifecycle !== "closed" && lifecycle !== "paused" ? (
          <button
            type="button"
            className="pc-btn-secondary text-sm"
            disabled={pending}
            onClick={() => run(() => pauseAdvocacyCampaign(orgSlug, { campaignId: campaign.id }))}
          >
            Pause campaign
          </button>
        ) : null}

        {lifecycle === "paused" ? (
          <button
            type="button"
            className="pc-btn-primary text-sm"
            disabled={pending}
            onClick={() => run(() => resumeAdvocacyCampaign(orgSlug, { campaignId: campaign.id }))}
          >
            Resume campaign
          </button>
        ) : null}

        {lifecycle === "collecting" || lifecycle === "goal_met" || lifecycle === "live" ? (
          <button
            type="button"
            className="pc-btn-secondary text-sm"
            disabled={pending}
            onClick={() =>
              run(() => recordAdvocacyResponse(orgSlug, { campaignId: campaign.id, increment: 1 }))
            }
          >
            Record +1 response
          </button>
        ) : null}

        {lifecycle === "goal_met" || lifecycle === "collecting" || lifecycle === "live" ? (
          <button
            type="button"
            className="pc-btn-secondary text-sm"
            disabled={pending}
            onClick={() => run(() => closeAdvocacyCampaign(orgSlug, { campaignId: campaign.id }))}
          >
            Close campaign
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="pp-campaign-os__msg pp-campaign-os__msg--ok" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="pp-campaign-os__msg pp-campaign-os__msg--err" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
