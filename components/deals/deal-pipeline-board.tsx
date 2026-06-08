import { DEAL_STAGE_LABEL, ACTIVE_DEAL_STAGES } from "@/lib/deals/constants";

type DealRow = {
  id: string;
  title: string;
  amountCents: number;
  stage: string;
  assigneeName: string;
  pipeline: { name: string };
};

export function DealPipelineBoard({ deals }: { deals: DealRow[] }) {
  const columns = [...ACTIVE_DEAL_STAGES, "WON" as const, "LOST" as const];

  return (
    <div className="grid gap-4 overflow-x-auto lg:grid-cols-3 xl:grid-cols-6">
      {columns.map((stage) => {
        const col = deals.filter((d) => d.stage === stage);
        return (
          <div key={stage} className="min-w-[12rem] rounded-xl border border-[var(--pc-border)] bg-white/60 p-3">
            <h3 className="text-sm font-semibold text-zinc-800">
              {DEAL_STAGE_LABEL[stage] ?? stage}
              <span className="ml-1 text-zinc-400">({col.length})</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {col.map((d) => (
                <li key={d.id} className="rounded-lg border border-[var(--pc-border)]/80 p-2 text-sm">
                  <p className="font-medium text-zinc-900">{d.title}</p>
                  <p className="text-xs text-zinc-500">
                    ${(d.amountCents / 100).toLocaleString()} · {d.assigneeName || "Unassigned"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
