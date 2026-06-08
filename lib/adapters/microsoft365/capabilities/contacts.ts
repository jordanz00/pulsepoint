import { graphGet } from "@/lib/adapters/microsoft365/graph-fetch";
import type { GraphContact } from "@/lib/adapters/microsoft365/types";

type ContactsResponse = {
  value?: Array<{
    id: string;
    displayName?: string;
    emailAddresses?: Array<{ address?: string }>;
    companyName?: string;
  }>;
};

export async function fetchContacts(
  accessToken: string,
  limit = 20,
): Promise<GraphContact[]> {
  const data = await graphGet<ContactsResponse>(
    accessToken,
    `/me/contacts?$top=${limit}&$orderby=displayName&$select=id,displayName,emailAddresses,companyName`,
  );

  return (data.value ?? []).map((c) => ({
    id: c.id,
    displayName: c.displayName ?? "Unknown",
    email: c.emailAddresses?.[0]?.address ?? null,
    company: c.companyName ?? null,
  }));
}
