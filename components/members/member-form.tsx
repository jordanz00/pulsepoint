"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FORM_HELP } from "@/lib/form-help-copy";
import { createMember, updateMember } from "@/app/actions/members";
import type { MemberFormOrg, MemberFormTier } from "@/lib/member-form-options";

export type MemberFormInitial = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "LAPSED";
  tags?: string[];
  company?: string;
  jobTitle?: string;
  tierId?: string;
  renewalDueAt?: string;
  organizationAccountId?: string;
  relationshipHealth?: "STRONG" | "STEADY" | "COOLING" | "AT_RISK";
};

function toDateInputValue(iso?: string | Date | null) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

type Props = {
  orgSlug: string;
  memberId?: string;
  initial?: MemberFormInitial;
  tiers?: MemberFormTier[];
  organizations?: MemberFormOrg[];
};

export function MemberForm({ orgSlug, memberId, initial, tiers = [], organizations = [] }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      status: String(formData.get("status") ?? "ACTIVE") as
        | "ACTIVE"
        | "INACTIVE"
        | "LAPSED",
      company: String(formData.get("company") ?? ""),
      jobTitle: String(formData.get("jobTitle") ?? ""),
      tierId: String(formData.get("tierId") ?? ""),
      renewalDueAt: String(formData.get("renewalDueAt") ?? ""),
      organizationAccountId: String(formData.get("organizationAccountId") ?? ""),
      relationshipHealth: String(formData.get("relationshipHealth") ?? "") as
        | "STRONG"
        | "STEADY"
        | "COOLING"
        | "AT_RISK"
        | "",
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = memberId
      ? await updateMember(memberId, payload, orgSlug)
      : await createMember(payload, orgSlug);

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (memberId) {
      router.push(`/${orgSlug}/members/${memberId}`);
    } else {
      router.push(`/${orgSlug}/members`);
    }
    router.refresh();
  }

  return (
    <form action={onSubmit} className="pc-form-shell mc-member-form">
      {error ? <FormAlert variant="error">{error}</FormAlert> : null}

      <fieldset className="mc-form-section">
        <legend className="mc-form-section-title">Contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="firstName" label="First name" help={FORM_HELP.member.firstName} required>
            <Input name="firstName" required defaultValue={initial?.firstName} />
          </FormField>
          <FormField id="lastName" label="Last name" help={FORM_HELP.member.lastName} required>
            <Input name="lastName" required defaultValue={initial?.lastName} />
          </FormField>
        </div>
        <FormField id="email" label="Email" help={FORM_HELP.member.email}>
          <Input name="email" type="email" defaultValue={initial?.email ?? ""} />
        </FormField>
        <FormField id="phone" label="Phone" help={FORM_HELP.member.phone}>
          <Input name="phone" type="tel" defaultValue={initial?.phone ?? ""} />
        </FormField>
      </fieldset>

      <fieldset className="mc-form-section">
        <legend className="mc-form-section-title">Membership</legend>
        <FormField id="status" label="Status" help={FORM_HELP.member.status}>
          <Select name="status" defaultValue={initial?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="LAPSED">Lapsed</option>
          </Select>
        </FormField>
        {tiers.length > 0 ? (
          <FormField id="tierId" label="Dues tier" help="Assign the member to a membership tier for renewals and reporting.">
            <Select name="tierId" defaultValue={initial?.tierId ?? ""}>
              <option value="">No tier</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormField>
        ) : null}
        <FormField id="renewalDueAt" label="Renewal due" help="Next renewal date for member services and finance.">
          <Input
            name="renewalDueAt"
            type="date"
            defaultValue={toDateInputValue(initial?.renewalDueAt)}
          />
        </FormField>
        {organizations.length > 0 ? (
          <FormField
            id="organizationAccountId"
            label="Hospital / health system"
            help="Link this contact to a hospital or health system account on your roster."
          >
            <Select
              name="organizationAccountId"
              defaultValue={initial?.organizationAccountId ?? ""}
            >
              <option value="">None</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </FormField>
        ) : null}
      </fieldset>

      <fieldset className="mc-form-section">
        <legend className="mc-form-section-title">Professional & CRM</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="jobTitle" label="Job title" help="Role at the member organization (e.g. CEO, CNO).">
            <Input name="jobTitle" defaultValue={initial?.jobTitle ?? ""} />
          </FormField>
          <FormField id="company" label="Organization" help="Employer or affiliate name on the member record.">
            <Input name="company" defaultValue={initial?.company ?? ""} />
          </FormField>
        </div>
        <FormField id="relationshipHealth" label="Relationship health" help="Staff signal for outreach priority—not a sales stage.">
          <Select
            name="relationshipHealth"
            defaultValue={initial?.relationshipHealth ?? "STEADY"}
          >
            <option value="STRONG">Strong</option>
            <option value="STEADY">Steady</option>
            <option value="COOLING">Cooling</option>
            <option value="AT_RISK">At risk</option>
          </Select>
        </FormField>
        <FormField id="tags" label="Tags" help={FORM_HELP.member.tags}>
          <Input name="tags" defaultValue={initial?.tags?.join(", ") ?? ""} />
        </FormField>
      </fieldset>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : memberId ? "Update member" : "Create member"}
      </Button>
    </form>
  );
}
