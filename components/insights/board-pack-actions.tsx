"use client";

import { buildBoardPackHtml } from "@/lib/board-pack/build-board-pack-html";
import type { BoardPackChartInput, BoardPackDeltas } from "@/lib/board-pack/build-board-pack-html";
import type { ExecutiveDashboard } from "@/lib/executive-metrics";
import type { ExecutiveBrief } from "@/lib/copilot/executive-brief";

export function BoardPackActions({
  orgName,
  orgSlug,
  dashboard,
  brief,
  charts,
  deltas,
}: {
  orgName: string;
  orgSlug: string;
  dashboard: ExecutiveDashboard;
  brief: ExecutiveBrief;
  charts: BoardPackChartInput;
  deltas?: BoardPackDeltas;
}) {
  function html() {
    return buildBoardPackHtml({
      orgName,
      orgSlug,
      dashboard,
      brief,
      charts,
      deltas,
      generatedAt: new Date(),
    });
  }

  function downloadHtml() {
    const blob = new Blob([html()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsepoint-board-briefing-${orgSlug}-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPack() {
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return;
    w.document.write(html());
    w.document.close();
    w.focus();
    w.onload = () => w.print();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="pc-btn-primary text-sm" onClick={printPack}>
        Print / Save PDF
      </button>
      <button type="button" className="pc-btn-secondary text-sm" onClick={downloadHtml}>
        Download HTML
      </button>
    </div>
  );
}
