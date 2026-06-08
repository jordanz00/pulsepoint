import Link from "next/link";
import { AdOpsApiError } from "@/components/ad-ops/ad-ops-api-error";
import { adOpsApi } from "@/lib/ad-ops-api";
import { adOpsPaths } from "@/lib/ad-ops-paths";

export default async function AdvertisingRunbookPage({
  params,
}: {
  params: Promise<{ orgSlug: string; code: string }>;
}) {
  const { orgSlug, code } = await params;
  const p = adOpsPaths(orgSlug);

  try {
    const book = await adOpsApi<{ title: string; message: string; steps: string[] } | null>(
      `/runbooks/${code}`,
    );

    if (!book) {
      return (
        <>
          <h1>Runbook not found</h1>
          <Link href={p.sync}>← Sync queue</Link>
        </>
      );
    }

    return (
      <>
        <p>
          <Link href={p.sync}>← Sync queue</Link>
        </p>
        <h1>{book.title}</h1>
        <p>
          <code>{code}</code>
        </p>
        <p>{book.message}</p>
        <div className="card">
          <h2>Remediation steps</h2>
          <ol>
            {book.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      </>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return (
      <>
        <h1>Runbook</h1>
        <AdOpsApiError detail={msg} />
      </>
    );
  }
}
