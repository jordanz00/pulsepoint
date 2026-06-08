/**
 * Research Step 3 — Summarize analysis into executive brief.
 */
import type { AnalysisResult, ResearchSummary } from "@/quake-os/research/types";

export function summarizeAnalysis(
  analysis: AnalysisResult,
  sources: string[],
): ResearchSummary {
  const keyFindings = analysis.signals.map(
    (s) => `[${s.type}] ${s.label} (${s.confidence} confidence)`,
  );

  const gapCount = analysis.signals.filter((s) => s.type === "gap").length;
  const oppCount = analysis.signals.filter((s) => s.type === "opportunity").length;
  const riskCount = analysis.signals.filter((s) => s.type === "risk").length;

  const executiveSummary = [
    `Topic: ${analysis.topic}.`,
    `Analyzed ${analysis.sourceCount} source hits across ${sources.length} paths.`,
    gapCount ? `${gapCount} gap signal(s) identified.` : "No critical gaps flagged in corpus.",
    oppCount ? `${oppCount} opportunity signal(s) found.` : "",
    riskCount ? `${riskCount} risk signal(s) require compliance review.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    topic: analysis.topic,
    executiveSummary,
    keyFindings,
    sources,
    analyzedAt: analysis.analyzedAt,
  };
}
