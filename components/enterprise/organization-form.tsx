"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createMemberOrganization,
  updateMemberOrganization,
} from "@/app/actions/member-organizations";
import { FACILITY_TYPE_SINGULAR } from "@/lib/facility-organization";
import { memberOrganizationTypeSchema } from "@/lib/validations/member-organization";

const TYPES = memberOrganizationTypeSchema.options;

const OWNERSHIP = ["NONPROFIT", "FOR_PROFIT", "GOVERNMENT", "OTHER"] as const;

export type OrganizationFormInitial = {
  name: string;
  type: (typeof TYPES)[number];
  parentId?: string;
  region?: string;
  bedCount?: number | null;
  ownership?: (typeof OWNERSHIP)[number] | "";
  membershipLevel?: string;
  participationLevel?: string;
};

export function OrganizationForm({
  orgSlug,
  accountId,
  initial,
  parentOptions,
}: {
  orgSlug: string;
  accountId?: string;
  initial?: OrganizationFormInitial;
  parentOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "HOSPITAL"),
      parentId: String(formData.get("parentId") ?? ""),
      region: String(formData.get("region") ?? ""),
      bedCount: String(formData.get("bedCount") ?? ""),
      ownership: String(formData.get("ownership") ?? ""),
      membershipLevel: String(formData.get("membershipLevel") ?? ""),
      participationLevel: String(formData.get("participationLevel") ?? ""),
    };

    const result = accountId
      ? await updateMemberOrganization(accountId, payload, orgSlug)
      : await createMemberOrganization(payload, orgSlug);

    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (accountId) {
      router.refresh();
    } else if (result.data?.id) {
      router.push(`/${orgSlug}/enterprise/organizations/${result.data.id}`);
    } else {
      router.push(`/${orgSlug}/enterprise/organizations`);
    }
  }

  return (
    <form action={onSubmit} className="pc-form-shell max-w-xl">
      {error ? <FormAlert variant="error">{error}</FormAlert> : null}
      <FormField id="name" label="Account name" required>
        <Input name="name" required defaultValue={initial?.name} />
      </FormField>
      <FormField id="type" label="Account type">
        <Select name="type" defaultValue={initial?.type ?? "HOSPITAL"}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {FACILITY_TYPE_SINGULAR[t]}
            </option>
          ))}
        </Select>
      </FormField>
      {parentOptions.length > 0 ? (
        <FormField id="parentId" label="Parent health system (optional)">
          <Select name="parentId" defaultValue={initial?.parentId ?? ""}>
            <option value="">None — top-level account</option>
            {parentOptions
              .filter((p) => p.id !== accountId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </Select>
        </FormField>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="region" label="Region">
          <Input name="region" defaultValue={initial?.region ?? ""} placeholder="e.g. Southeast PA" />
        </FormField>
        <FormField id="bedCount" label="Bed count">
          <Input
            name="bedCount"
            type="number"
            min={0}
            defaultValue={initial?.bedCount ?? ""}
          />
        </FormField>
      </div>
      <FormField id="ownership" label="Ownership">
        <Select name="ownership" defaultValue={initial?.ownership ?? ""}>
          <option value="">Not specified</option>
          {OWNERSHIP.map((o) => (
            <option key={o} value={o}>
              {o.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="membershipLevel" label="Membership level">
          <Input name="membershipLevel" defaultValue={initial?.membershipLevel ?? ""} />
        </FormField>
        <FormField id="participationLevel" label="Participation level">
          <Input name="participationLevel" defaultValue={initial?.participationLevel ?? ""} />
        </FormField>
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : accountId ? "Update account" : "Create account"}
      </Button>
    </form>
  );
}
