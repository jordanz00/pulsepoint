/** Web form field definitions for hosted capture forms. */

export type WebFormFieldType = "text" | "email" | "phone" | "textarea" | "select";

export type WebFormFieldDef = {
  id: string;
  label: string;
  type: WebFormFieldType;
  required?: boolean;
  options?: string[];
};

export const DEFAULT_LEAD_FORM_FIELDS: WebFormFieldDef[] = [
  { id: "firstName", label: "First name", type: "text", required: true },
  { id: "lastName", label: "Last name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "company", label: "Organization", type: "text" },
  { id: "jobTitle", label: "Title", type: "text" },
  { id: "interest", label: "Interest", type: "select", options: ["Membership", "Events", "Sponsorship", "Other"] },
];

export function parseWebFormFields(raw: unknown): WebFormFieldDef[] {
  if (!Array.isArray(raw)) return DEFAULT_LEAD_FORM_FIELDS;
  const out: WebFormFieldDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const f = item as Record<string, unknown>;
    const id = typeof f.id === "string" ? f.id.slice(0, 40) : "";
    const label = typeof f.label === "string" ? f.label.slice(0, 80) : id;
    const type = f.type as WebFormFieldType;
    if (!id || !["text", "email", "phone", "textarea", "select"].includes(type)) continue;
    out.push({
      id,
      label,
      type,
      required: Boolean(f.required),
      options: Array.isArray(f.options)
        ? f.options.map((o) => String(o).slice(0, 60)).slice(0, 12)
        : undefined,
    });
  }
  return out.length ? out : DEFAULT_LEAD_FORM_FIELDS;
}

export function normalizeFormPayload(
  fields: WebFormFieldDef[],
  raw: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = raw[f.id];
    if (v == null || v === "") {
      if (f.required) throw new Error(`Missing required field: ${f.label}`);
      continue;
    }
    const s = String(v).trim().slice(0, 500);
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
      throw new Error(`Invalid email for ${f.label}`);
    }
    out[f.id] = s;
  }
  return out;
}
