/**
 * Structured slices stored on Member.customFields (JSON).
 * Keeps address, billing, and communication prefs editable without schema migration.
 */

import { z } from "zod";

export const memberAddressSchema = z.object({
  line1: z.string().max(200).default(""),
  line2: z.string().max(200).default(""),
  city: z.string().max(100).default(""),
  state: z.string().max(50).default(""),
  postalCode: z.string().max(20).default(""),
  country: z.string().max(100).default("US"),
});

export const memberBillingSchema = z.object({
  billToName: z.string().max(200).default(""),
  billingEmail: z.string().max(254).default(""),
  defaultPaymentMethod: z
    .enum(["card", "ach", "check", "invoice", ""])
    .default("card"),
  poNumber: z.string().max(80).default(""),
  autopay: z.boolean().default(false),
});

export const memberCommPrefsSchema = z.object({
  preferredChannel: z.enum(["email", "phone", "mail"]).default("email"),
  emailMarketing: z.boolean().default(true),
  eventReminders: z.boolean().default(true),
  renewalNotices: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
});

export type MemberAddress = z.infer<typeof memberAddressSchema>;
export type MemberBilling = z.infer<typeof memberBillingSchema>;
export type MemberCommPrefs = z.infer<typeof memberCommPrefsSchema>;

export type MemberExtendedFields = {
  address: MemberAddress;
  billing: MemberBilling;
  communicationPreferences: MemberCommPrefs;
  otherDetails: string;
  /** License / credential line (demo seed uses this key). */
  credentials: string;
  /** License state (demo seed). */
  licenseState: string;
};

const EMPTY: MemberExtendedFields = {
  address: memberAddressSchema.parse({}),
  billing: memberBillingSchema.parse({}),
  communicationPreferences: memberCommPrefsSchema.parse({}),
  otherDetails: "",
  credentials: "",
  licenseState: "",
};

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

export function parseExtendedFields(customFields: unknown): MemberExtendedFields {
  const raw = asRecord(customFields);
  const address = memberAddressSchema.safeParse(raw.address ?? {});
  const billing = memberBillingSchema.safeParse(raw.billing ?? {});
  const comm = memberCommPrefsSchema.safeParse(
    raw.communicationPreferences ?? raw.commPrefs ?? {},
  );

  return {
    address: address.success ? address.data : EMPTY.address,
    billing: billing.success ? billing.data : EMPTY.billing,
    communicationPreferences: comm.success ? comm.data : EMPTY.communicationPreferences,
    otherDetails: typeof raw.otherDetails === "string" ? raw.otherDetails : "",
    credentials: typeof raw.credentials === "string" ? raw.credentials : "",
    licenseState: typeof raw.state === "string" ? raw.state : "",
  };
}

export function mergeExtendedIntoCustomFields(
  existing: unknown,
  patch: {
    address?: Partial<MemberAddress>;
    billing?: Partial<MemberBilling>;
    communicationPreferences?: Partial<MemberCommPrefs>;
    otherDetails?: string;
    credentials?: string;
    licenseState?: string;
  },
): Record<string, unknown> {
  const base = asRecord(existing);
  const current = parseExtendedFields(base);

  const next: Record<string, unknown> = {
    ...base,
    address: { ...current.address, ...patch.address },
    billing: { ...current.billing, ...patch.billing },
    communicationPreferences: {
      ...current.communicationPreferences,
      ...patch.communicationPreferences,
    },
    otherDetails:
      patch.otherDetails !== undefined ? patch.otherDetails : current.otherDetails,
    credentials:
      patch.credentials !== undefined ? patch.credentials : current.credentials,
    state: patch.licenseState !== undefined ? patch.licenseState : current.licenseState,
  };

  return next;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Card on file",
  ach: "ACH / bank transfer",
  check: "Check",
  invoice: "Invoice / PO",
  "": "Not set",
};

export const PREFERRED_CHANNEL_LABELS: Record<MemberCommPrefs["preferredChannel"], string> = {
  email: "Email",
  phone: "Phone",
  mail: "Postal mail",
};
