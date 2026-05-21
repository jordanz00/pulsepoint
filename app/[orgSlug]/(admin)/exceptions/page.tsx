import Link from "next/link";
import { listOpenExceptions } from "@/app/actions/exceptions";
import { ResolveExceptionButton } from "@/components/exceptions/resolve-button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ExceptionsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const result = await listOpenExceptions();
  const items = result.ok ? result.data!.items : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exception queue"
        subtitle="Partial automation failures (soft-fail) — triage here instead of silent errors. Admins only."
        badge="live"
        backHref={`/${orgSlug}/work`}
        backLabel="PulsePoint Work"
      />

      {!result.ok && <p className="text-sm text-red-600">{result.error}</p>}

      {items.length === 0 ? (
        <EmptyState
          title="No open exceptions"
          description="When email or webhook steps fail safely, they appear here for staff review."
        />
      ) : (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white shadow-sm">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {item.workflow} · {item.step}
                  </p>
                  <p className="mt-1 text-sm text-amber-700">{item.outcome}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.createdAt.toLocaleString()}
                  </p>
                </div>
                <ResolveExceptionButton exceptionId={item.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
