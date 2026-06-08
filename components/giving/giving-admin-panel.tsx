"use client";

import { useId, useState, useTransition } from "react";
import {
  createCampaign,
  recordDonation,
  updateCampaign,
} from "@/app/actions/giving";
import { FormField } from "@/components/ui/form-field";

type CampaignRow = {
  id: string;
  name: string;
  status: string;
};

export function GivingAdminPanel({
  orgSlug,
  campaigns,
}: {
  orgSlug: string;
  campaigns: CampaignRow[];
}) {
  const nameId = useId();
  const descId = useId();
  const goalId = useId();
  const statusId = useId();
  const offlineCampaignId = useId();
  const offlineNameId = useId();
  const offlineEmailId = useId();
  const offlineAmountId = useId();

  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="giving-admin">
      {msg ? (
        <p className="giving-admin__msg" role="status" aria-live="polite">
          {msg}
        </p>
      ) : null}

      <form
        className="giving-admin__panel"
        aria-labelledby="giving-new-campaign-heading"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await createCampaign(orgSlug, {
              name: String(fd.get("name") ?? ""),
              description: String(fd.get("description") ?? ""),
              goalDollars: Number(fd.get("goalDollars") ?? 0),
              status: String(fd.get("status") ?? "DRAFT"),
            });
            setMsg(res.ok ? "Campaign created." : res.error);
            if (res.ok) e.currentTarget.reset();
          });
        }}
      >
        <h2 id="giving-new-campaign-heading" className="giving-section__title">
          New campaign
        </h2>
        <div className="giving-admin__fields">
          <FormField id={nameId} label="Name" required>
            <input name="name" required className="pc-input" />
          </FormField>
          <FormField id={descId} label="Purpose">
            <textarea name="description" className="pc-textarea" rows={2} />
          </FormField>
          <FormField id={goalId} label="Goal (USD)">
            <input name="goalDollars" type="number" min={0} step={1} className="pc-input" />
          </FormField>
          <FormField id={statusId} label="Status">
            <select name="status" className="pc-input" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </FormField>
        </div>
        <button type="submit" className="ds-btn ds-btn--primary" disabled={pending}>
          Create campaign
        </button>
      </form>

      <form
        className="giving-admin__panel"
        aria-labelledby="giving-offline-heading"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await recordDonation(orgSlug, {
              campaignId: String(fd.get("campaignId") ?? ""),
              donorName: String(fd.get("donorName") ?? ""),
              donorEmail: String(fd.get("donorEmail") ?? "") || undefined,
              amountDollars: Number(fd.get("amountDollars") ?? 0),
            });
            setMsg(res.ok ? "Gift recorded." : res.error);
            if (res.ok) e.currentTarget.reset();
          });
        }}
      >
        <h2 id="giving-offline-heading" className="giving-section__title">
          Record offline gift
        </h2>
        <div className="giving-admin__fields">
          <FormField id={offlineCampaignId} label="Campaign" required>
            <select name="campaignId" required className="pc-input" defaultValue="">
              <option value="" disabled>
                Select campaign
              </option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id={offlineNameId} label="Donor name" required>
            <input name="donorName" required className="pc-input" />
          </FormField>
          <FormField id={offlineEmailId} label="Email">
            <input name="donorEmail" type="email" className="pc-input" />
          </FormField>
          <FormField id={offlineAmountId} label="Amount (USD)" required>
            <input name="amountDollars" type="number" min={1} required className="pc-input" />
          </FormField>
        </div>
        <button type="submit" className="ds-btn ds-btn--secondary" disabled={pending}>
          Record gift
        </button>
      </form>
    </div>
  );
}

export function CampaignStatusSelect({
  orgSlug,
  campaignId,
  status,
}: {
  orgSlug: string;
  campaignId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="pc-input giving-status-select"
      defaultValue={status}
      disabled={pending}
      aria-label="Campaign status"
      onChange={(e) => {
        startTransition(async () => {
          await updateCampaign(orgSlug, {
            id: campaignId,
            status: e.target.value as "DRAFT" | "ACTIVE" | "CLOSED",
          });
        });
      }}
    >
      <option value="DRAFT">Draft</option>
      <option value="ACTIVE">Active</option>
      <option value="CLOSED">Closed</option>
    </select>
  );
}
