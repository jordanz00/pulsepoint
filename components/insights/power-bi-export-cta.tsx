"use client";

type Props = {
  orgSlug: string;
};

export function PowerBiExportCta({ orgSlug }: Props) {
  return (
    <div className="pc-glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">Export for Power BI</p>
        <p className="text-xs text-[var(--pc-text-muted)] mt-1">
          Pilot uses CSV semantic export. Native embed is on the roadmap — see{" "}
          <code className="text-xs">docs/POWER-BI-SEMANTIC-LAYER.md</code>.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/copilot/executive-brief?orgSlug=${encodeURIComponent(orgSlug)}`}
          className="pc-btn-secondary text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          JSON briefing
        </a>
        <button
          type="button"
          className="pc-btn-primary text-sm"
          onClick={() => {
            window.alert(
              "Run locally: pnpm continuity:export\nThen import CSVs into Power BI Desktop per docs/POWER-BI-SEMANTIC-LAYER.md",
            );
          }}
        >
          Export guide
        </button>
      </div>
    </div>
  );
}
