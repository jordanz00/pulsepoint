/**
 * Research Step 2 — Analyze search hits into signals.
 */
import type { AnalysisResult, AnalysisSignal, SearchResult } from "@/quake-os/research/types";

const GAP_PATTERNS = [/roadmap/i, /alpha/i, /foundation/i, /missing/i, /gap/i, /stub/i, /pending/i];
const STRENGTH_PATTERNS = [/live/i, /implemented/i, /operational/i, /pass/i, /shipped/i];
const RISK_PATTERNS = [/security/i, /tenant/i, /leak/i, /compliance/i, /hipaa/i, /reject/i];
const OPPORTUNITY_PATTERNS = [/opportunity/i, /differentiat/i, /wedge/i, /modern/i, /automate/i];

function classifyLine(line: string): AnalysisSignal["type"] | null {
  if (RISK_PATTERNS.some((p) => p.test(line))) return "risk";
  if (GAP_PATTERNS.some((p) => p.test(line))) return "gap";
  if (OPPORTUNITY_PATTERNS.some((p) => p.test(line))) return "opportunity";
  if (STRENGTH_PATTERNS.some((p) => p.test(line))) return "strength";
  return null;
}

export function analyzeSearchResults(search: SearchResult): AnalysisResult {
  const bucket = new Map<AnalysisSignal["type"], Set<string>>();

  for (const hit of search.hits) {
    const type = classifyLine(hit.excerpt);
    if (!type) continue;
    if (!bucket.has(type)) bucket.set(type, new Set());
    bucket.get(type)!.add(`${hit.path}: ${hit.excerpt.slice(0, 120)}`);
  }

  const signals: AnalysisSignal[] = [];
  for (const [type, evidence] of bucket) {
    const items = [...evidence].slice(0, 5);
    if (items.length === 0) continue;
    signals.push({
      type,
      label: `${type} signals for ${search.query.topic}`,
      evidence: items,
      confidence: items.length >= 3 ? "high" : items.length >= 2 ? "medium" : "low",
    });
  }

  if (signals.length === 0 && search.hits.length > 0) {
    signals.push({
      type: "opportunity",
      label: `Research baseline for ${search.query.topic}`,
      evidence: search.hits.slice(0, 3).map((h) => h.excerpt),
      confidence: "medium",
    });
  }

  return {
    topic: search.query.topic,
    signals,
    sourceCount: search.hits.length,
    analyzedAt: new Date().toISOString(),
  };
}
