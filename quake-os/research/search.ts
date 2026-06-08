/**
 * Research Step 1 — Search local repo sources and knowledge databases.
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@/quake-os/core/paths";
import { knowledgeSearch } from "@/quake-os/knowledge/store";
import type { ResearchQuery, SearchHit, SearchResult } from "@/quake-os/research/types";

const MAX_FILE_BYTES = 120_000;
const MAX_HITS = 24;

function safeRead(filePath: string): string | null {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return null;
  const buf = fs.readFileSync(abs);
  if (buf.length > MAX_FILE_BYTES) return buf.subarray(0, MAX_FILE_BYTES).toString("utf8");
  return buf.toString("utf8");
}

function scoreLine(line: string, keywords: string[]): { score: number; matched: string[] } {
  const lower = line.toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return { score: matched.length, matched };
}

function searchFile(query: ResearchQuery, filePath: string): SearchHit[] {
  const content = safeRead(filePath);
  if (!content) return [];

  const hits: SearchHit[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 8) continue;
    const { score, matched } = scoreLine(line, query.keywords);
    if (score === 0) continue;
    hits.push({
      source: path.basename(filePath),
      path: filePath,
      excerpt: line.slice(0, 240),
      relevance: score / query.keywords.length,
      matchedKeywords: matched,
    });
  }
  return hits;
}

function searchKnowledge(query: ResearchQuery): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const term of query.keywords.slice(0, 3)) {
    for (const category of ["research", "competitors", "requirements", "decisions"] as const) {
      const rows = knowledgeSearch(category, term, 5);
      for (const row of rows) {
        hits.push({
          source: `knowledge:${category}`,
          path: `knowledge/${category}.db#${row.id}`,
          excerpt: row.title,
          relevance: 0.7,
          matchedKeywords: [term],
        });
      }
    }
  }
  return hits;
}

export function searchSources(query: ResearchQuery): SearchResult {
  const allHits: SearchHit[] = [];

  for (const filePath of query.sourcePaths) {
    allHits.push(...searchFile(query, filePath));
  }
  allHits.push(...searchKnowledge(query));

  const deduped = new Map<string, SearchHit>();
  for (const hit of allHits) {
    const key = `${hit.path}:${hit.excerpt}`;
    const prev = deduped.get(key);
    if (!prev || hit.relevance > prev.relevance) deduped.set(key, hit);
  }

  const hits = [...deduped.values()]
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MAX_HITS);

  return {
    query,
    hits,
    searchedAt: new Date().toISOString(),
  };
}
