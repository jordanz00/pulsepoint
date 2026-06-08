import { graphGet } from "@/lib/adapters/microsoft365/graph-fetch";
import type { GraphMailThread } from "@/lib/adapters/microsoft365/types";

type MessagesResponse = {
  value?: Array<{
    id: string;
    subject?: string;
    from?: { emailAddress?: { address?: string; name?: string } };
    bodyPreview?: string;
    isRead?: boolean;
    receivedDateTime?: string;
  }>;
};

export async function fetchMailThreads(
  accessToken: string,
  limit = 15,
): Promise<GraphMailThread[]> {
  const data = await graphGet<MessagesResponse>(
    accessToken,
    `/me/messages?$top=${limit}&$orderby=receivedDateTime desc&$select=id,subject,from,bodyPreview,isRead,receivedDateTime`,
  );

  return (data.value ?? []).map((m) => ({
    id: m.id,
    subject: m.subject ?? "(No subject)",
    from: m.from?.emailAddress?.name ?? m.from?.emailAddress?.address ?? "Unknown",
    preview: (m.bodyPreview ?? "").slice(0, 200),
    receivedAt: m.receivedDateTime ?? new Date().toISOString(),
    isRead: Boolean(m.isRead),
  }));
}
