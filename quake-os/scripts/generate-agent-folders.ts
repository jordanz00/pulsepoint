#!/usr/bin/env tsx
/** Generate agent subfolders from registry.json */
import fs from "node:fs";
import path from "node:path";
import type { AgentManifest } from "@/quake-os/core/types";
import { AGENT_REGISTRY_PATH, QUAKE_OS_ROOT } from "@/quake-os/core/paths";

const raw = JSON.parse(fs.readFileSync(AGENT_REGISTRY_PATH, "utf8")) as { agents: AgentManifest[] };

for (const agent of raw.agents) {
  const dir = path.join(QUAKE_OS_ROOT, "agents", agent.id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(agent, null, 2));
  const md = `# ${agent.name}

**ID:** \`${agent.id}\`  
**Role:** ${agent.role}  
**Cursor:** \`@${agent.cursorAgent ?? agent.id}\`

## Objectives
${agent.objectives.map((o) => `- ${o}`).join("\n")}

## Responsibilities
${agent.responsibilities.map((r) => `- ${r}`).join("\n")}

## Memory access
${agent.memoryAccess.map((m) => `- \`${m}/\``).join("\n")}
`;
  fs.writeFileSync(path.join(dir, "AGENT.md"), md);
}

console.log(`Generated ${raw.agents.length} agent folders.`);
