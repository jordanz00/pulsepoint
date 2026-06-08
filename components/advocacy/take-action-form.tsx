"use client";

import { useId, useState, useTransition } from "react";
import type { PublicHospitalOption } from "@/lib/advocacy/load-public-campaign";

export function TakeActionForm({
  orgSlug,
  campaignId,
  hospitals,
}: {
  orgSlug: string;
  campaignId: string;
  hospitals: PublicHospitalOption[];
}) {
  const nameId = useId();
  const emailId = useId();
  const titleId = useId();
  const hospitalId = useId();
  const hospitalSelectId = useId();
  const positionId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  return (
    <form
      className="giving-donate-form pp-advocacy-take-action-form"
      aria-label="Hospital take-action form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setError(null);
        setSuccess(false);
        setDuplicate(false);
        startTransition(async () => {
          const selectedHospital = String(fd.get("memberOrganizationId") ?? "");
          const matched = selectedHospital
            ? hospitals.find((h) => h.id === selectedHospital)
            : undefined;
          const hospitalName = matched
            ? matched.name
            : String(fd.get("hospitalName") ?? "").trim();
          if (hospitalName.length < 2) {
            setError("Enter your hospital or health system name.");
            return;
          }

          const res = await fetch(`/api/public/advocacy/${orgSlug}/${campaignId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              responderName: String(fd.get("responderName") ?? ""),
              responderEmail: String(fd.get("responderEmail") ?? ""),
              responderTitle: String(fd.get("responderTitle") ?? ""),
              hospitalName,
              memberOrganizationId: selectedHospital || undefined,
              position: String(fd.get("position") ?? "SUPPORT"),
            }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            message?: string;
            duplicate?: boolean;
          };
          if (!res.ok || !data.ok) {
            setError(data.message ?? "Submission failed. Try again.");
            return;
          }
          setSuccess(true);
          setDuplicate(!!data.duplicate);
          form.reset();
        });
      }}
    >
      {success ? (
        <p className="giving-banner giving-banner--ok" role="status">
          {duplicate
            ? "We already have your response on file for this campaign. Thank you."
            : "Thank you. Your hospital response was recorded."}
        </p>
      ) : null}
      {error ? (
        <p className="giving-banner giving-banner--err" role="alert">
          {error}
        </p>
      ) : null}

      <label className="giving-donate-form__field" htmlFor={nameId}>
        Your name
        <input
          id={nameId}
          name="responderName"
          required
          maxLength={120}
          autoComplete="name"
          className="giving-donate-form__input"
        />
      </label>

      <label className="giving-donate-form__field" htmlFor={emailId}>
        Work email
        <input
          id={emailId}
          name="responderEmail"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className="giving-donate-form__input"
        />
      </label>

      <label className="giving-donate-form__field" htmlFor={titleId}>
        Title (optional)
        <input
          id={titleId}
          name="responderTitle"
          maxLength={120}
          autoComplete="organization-title"
          className="giving-donate-form__input"
          placeholder="CEO, Government Relations Director"
        />
      </label>

      {hospitals.length > 0 ? (
        <label className="giving-donate-form__field" htmlFor={hospitalSelectId}>
          Hospital / health system
          <select
            id={hospitalSelectId}
            name="memberOrganizationId"
            className="giving-donate-form__input"
            defaultValue=""
          >
            <option value="">Choose your hospital…</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
            <option value="">Other — type name below</option>
          </select>
        </label>
      ) : null}

      <label className="giving-donate-form__field" htmlFor={hospitalId}>
        Hospital name {hospitals.length > 0 ? "(if not listed)" : ""}
        <input
          id={hospitalId}
          name="hospitalName"
          required={hospitals.length === 0}
          maxLength={200}
          className="giving-donate-form__input"
          placeholder="Member hospital or health network"
        />
      </label>

      <label className="giving-donate-form__field" htmlFor={positionId}>
        Position on this issue
        <select id={positionId} name="position" className="giving-donate-form__input" defaultValue="SUPPORT">
          <option value="SUPPORT">Support</option>
          <option value="OPPOSE">Oppose</option>
          <option value="NEUTRAL">Neutral / comment only</option>
        </select>
      </label>

      <button type="submit" className="giving-donate-form__submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit response"}
      </button>

      <p className="pp-advocacy-take-action-privacy text-xs text-zinc-500">
        No patient information. Your response is shared with association government affairs staff only.
      </p>
    </form>
  );
}
