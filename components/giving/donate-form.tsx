"use client";

import { useId, useState, useTransition } from "react";
import { startDonationCheckout } from "@/app/actions/giving";
import { FormField } from "@/components/ui/form-field";

const PRESETS = [50, 100, 250, 500];

export function DonateForm({
  orgSlug,
  campaignId,
}: {
  orgSlug: string;
  campaignId: string;
  campaignName?: string;
}) {
  const amountId = useId();
  const nameId = useId();
  const emailId = useId();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="giving-donate-form"
      aria-label="Donation form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const res = await startDonationCheckout(orgSlug, {
            campaignId,
            donorName: String(fd.get("donorName") ?? ""),
            donorEmail: String(fd.get("donorEmail") ?? ""),
            amountDollars: Number(fd.get("amountDollars") ?? amount),
          });
          if (res.ok && res.data?.redirectUrl) {
            window.location.href = res.data.redirectUrl;
            return;
          }
          setError(res.ok ? "Checkout unavailable." : res.error);
        });
      }}
    >
      <fieldset className="giving-donate-form__presets-field">
        <legend className="giving-donate-form__presets-legend">Amount</legend>
        <div className="giving-donate-form__presets">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`giving-donate-form__preset${amount === p ? " giving-donate-form__preset--active" : ""}`}
              aria-pressed={amount === p}
              onClick={() => setAmount(p)}
            >
              ${p}
            </button>
          ))}
        </div>
      </fieldset>

      <FormField id={amountId} label="Custom amount (USD)" required>
        <input
          name="amountDollars"
          type="number"
          min={1}
          step={1}
          required
          className="pc-input"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </FormField>
      <FormField id={nameId} label="Your name" required>
        <input name="donorName" required className="pc-input" maxLength={200} />
      </FormField>
      <FormField id={emailId} label="Email for receipt" required>
        <input name="donorEmail" type="email" required className="pc-input" maxLength={254} />
      </FormField>

      <button type="submit" className="ds-btn ds-btn--primary giving-donate-form__submit" disabled={pending}>
        {pending ? "Starting checkout…" : `Donate $${amount}`}
      </button>
      {error ? (
        <p className="giving-donate-form__error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
