#!/usr/bin/env tsx
import { refreshBacklog } from "@/quake-os/core/backlog-engine";
import { syncLegacyBacklog } from "@/quake-os/core/memory-store";
import { initAllKnowledgeDbs } from "@/quake-os/knowledge/client";

syncLegacyBacklog();
initAllKnowledgeDbs();

const sources = (process.argv[2] ?? "legacy,ams,research,audits,recommendations").split(",") as Array<
  "legacy" | "ams" | "research" | "audits" | "recommendations"
>;

const result = refreshBacklog(sources);
console.log(JSON.stringify(result, null, 2));
