"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMemberProfileDetails } from "@/app/actions/member-profile-details";
import {
  PAYMENT_METHOD_LABELS,
  PREFERRED_CHANNEL_LABELS,
  type MemberAddress,
  type MemberBilling,
  type MemberCommPrefs,
  type MemberExtendedFields,
} from "@/lib/member-profile/extended-fields";

type Section = "address" | "billing" | "comms" | "other";

export function MemberProfileDetailsForm({
  orgSlug,
  memberId,
  extended,
  section,
  readOnly = false,
}: {
  orgSlug: string;
  memberId: string;
  extended: MemberExtendedFields;
  section: Section;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function save(payload: Parameters<typeof updateMemberProfileDetails>[2]) {
    setPending(true);
    setError(null);
    setOk(false);
    const result = await updateMemberProfileDetails(memberId, orgSlug, payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save");
      return;
    }
    setOk(true);
    router.refresh();
  }

  if (section === "address") {
    return (
      <ProfileForm
        title="Mailing address"
        readOnly={readOnly}
        pending={pending}
        error={error}
        ok={ok}
        onSubmit={(fd) =>
          save({
            address: {
              line1: String(fd.get("line1") ?? ""),
              line2: String(fd.get("line2") ?? ""),
              city: String(fd.get("city") ?? ""),
              state: String(fd.get("state") ?? ""),
              postalCode: String(fd.get("postalCode") ?? ""),
              country: String(fd.get("country") ?? "US"),
            },
          })
        }
      >
        <FieldGrid>
          <Field label="Line 1" name="line1" defaultValue={extended.address.line1} readOnly={readOnly} />
          <Field label="Line 2" name="line2" defaultValue={extended.address.line2} readOnly={readOnly} />
          <Field label="City" name="city" defaultValue={extended.address.city} readOnly={readOnly} />
          <Field label="State / province" name="state" defaultValue={extended.address.state} readOnly={readOnly} />
          <Field label="Postal code" name="postalCode" defaultValue={extended.address.postalCode} readOnly={readOnly} />
          <Field label="Country" name="country" defaultValue={extended.address.country} readOnly={readOnly} />
        </FieldGrid>
      </ProfileForm>
    );
  }

  if (section === "billing") {
    return (
      <ProfileForm
        title="Default billing"
        readOnly={readOnly}
        pending={pending}
        error={error}
        ok={ok}
        onSubmit={(fd) =>
          save({
            billing: {
              billToName: String(fd.get("billToName") ?? ""),
              billingEmail: String(fd.get("billingEmail") ?? ""),
              defaultPaymentMethod: String(fd.get("defaultPaymentMethod") ?? "") as MemberBilling["defaultPaymentMethod"],
              poNumber: String(fd.get("poNumber") ?? ""),
              autopay: fd.get("autopay") === "on",
            },
          })
        }
      >
        <FieldGrid>
          <Field label="Bill-to name" name="billToName" defaultValue={extended.billing.billToName} readOnly={readOnly} />
          <Field label="Billing email" name="billingEmail" type="email" defaultValue={extended.billing.billingEmail} readOnly={readOnly} />
          <div className="mc-field">
            <label className="mc-field-label" htmlFor="defaultPaymentMethod">
              Default payment method
            </label>
            {readOnly ? (
              <p className="mc-field-value">
                {PAYMENT_METHOD_LABELS[extended.billing.defaultPaymentMethod] ?? "Not set"}
              </p>
            ) : (
              <select id="defaultPaymentMethod" name="defaultPaymentMethod" className="mc-select" defaultValue={extended.billing.defaultPaymentMethod}>
                <option value="card">Card on file</option>
                <option value="ach">ACH / bank transfer</option>
                <option value="check">Check</option>
                <option value="invoice">Invoice / PO</option>
              </select>
            )}
          </div>
          <Field label="PO number" name="poNumber" defaultValue={extended.billing.poNumber} readOnly={readOnly} />
          <div className="mc-field mc-membership-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="autopay"
                defaultChecked={extended.billing.autopay}
                disabled={readOnly}
              />
              Autopay enabled for renewals
            </label>
          </div>
        </FieldGrid>
      </ProfileForm>
    );
  }

  if (section === "comms") {
    return (
      <ProfileForm
        title="Communication preferences"
        readOnly={readOnly}
        pending={pending}
        error={error}
        ok={ok}
        onSubmit={(fd) =>
          save({
            communicationPreferences: {
              preferredChannel: String(fd.get("preferredChannel") ?? "email") as MemberCommPrefs["preferredChannel"],
              emailMarketing: fd.get("emailMarketing") === "on",
              eventReminders: fd.get("eventReminders") === "on",
              renewalNotices: fd.get("renewalNotices") === "on",
              smsAlerts: fd.get("smsAlerts") === "on",
            },
          })
        }
      >
        <div className="mc-field">
          <label className="mc-field-label" htmlFor="preferredChannel">
            Preferred channel
          </label>
          {readOnly ? (
            <p className="mc-field-value">
              {PREFERRED_CHANNEL_LABELS[extended.communicationPreferences.preferredChannel]}
            </p>
          ) : (
            <select id="preferredChannel" name="preferredChannel" className="mc-select" defaultValue={extended.communicationPreferences.preferredChannel}>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="mail">Postal mail</option>
            </select>
          )}
        </div>
        <PrefToggle label="Email marketing" name="emailMarketing" checked={extended.communicationPreferences.emailMarketing} readOnly={readOnly} />
        <PrefToggle label="Event reminders" name="eventReminders" checked={extended.communicationPreferences.eventReminders} readOnly={readOnly} />
        <PrefToggle label="Renewal notices" name="renewalNotices" checked={extended.communicationPreferences.renewalNotices} readOnly={readOnly} />
        <PrefToggle label="SMS alerts" name="smsAlerts" checked={extended.communicationPreferences.smsAlerts} readOnly={readOnly} />
      </ProfileForm>
    );
  }

  return (
    <ProfileForm
      title="Other details"
      readOnly={readOnly}
      pending={pending}
      error={error}
      ok={ok}
      onSubmit={(fd) =>
        save({
          otherDetails: String(fd.get("otherDetails") ?? ""),
          credentials: String(fd.get("credentials") ?? ""),
          licenseState: String(fd.get("licenseState") ?? ""),
        })
      }
    >
      <Field label="Credentials" name="credentials" defaultValue={extended.credentials} readOnly={readOnly} />
      <Field label="License state" name="licenseState" defaultValue={extended.licenseState} readOnly={readOnly} />
      <div className="mc-field mc-membership-span-2">
        <label className="mc-field-label" htmlFor="otherDetails">
          Notes & other details
        </label>
        {readOnly ? (
          <p className="mc-field-value whitespace-pre-wrap">
            {extended.otherDetails || "—"}
          </p>
        ) : (
          <textarea
            id="otherDetails"
            name="otherDetails"
            rows={4}
            className="mc-textarea w-full"
            defaultValue={extended.otherDetails}
          />
        )}
      </div>
    </ProfileForm>
  );
}

function ProfileForm({
  title,
  children,
  readOnly,
  pending,
  error,
  ok,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  readOnly: boolean;
  pending: boolean;
  error: string | null;
  ok: boolean;
  onSubmit: (fd: FormData) => void;
}) {
  return (
    <form
      className="mc-profile-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (readOnly) return;
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <h3 className="mc-profile-card-title">{title}</h3>
      {children}
      {!readOnly ? (
        <div className="mc-profile-card-actions">
          <button type="submit" className="mc-btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {ok ? <p className="text-sm text-emerald-700">Saved</p> : null}
        </div>
      ) : null}
    </form>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="mc-membership-grid">{children}</div>;
}

function Field({
  label,
  name,
  defaultValue,
  readOnly,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  readOnly: boolean;
  type?: string;
}) {
  return (
    <div className="mc-field">
      <label className="mc-field-label" htmlFor={name}>
        {label}
      </label>
      {readOnly ? (
        <p className="mc-field-value">{defaultValue || "—"}</p>
      ) : (
        <input id={name} name={name} type={type} className="mc-input w-full" defaultValue={defaultValue} />
      )}
    </div>
  );
}

function PrefToggle({
  label,
  name,
  checked,
  readOnly,
}: {
  label: string;
  name: string;
  checked: boolean;
  readOnly: boolean;
}) {
  return (
    <label className="mc-profile-pref-row">
      <span>{label}</span>
      {readOnly ? (
        <span className="mc-profile-pill">{checked ? "On" : "Off"}</span>
      ) : (
        <input type="checkbox" name={name} defaultChecked={checked} />
      )}
    </label>
  );
}
