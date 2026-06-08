/**
 * DocumentationAgent — syncs docs with wave output and backlog state.
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@/quake-os/core/paths";
import { generateId, memoryWrite } from "@/quake-os/core/memory-store";
import { listTasks } from "@/quake-os/core/task-engine";
import { sendMessage } from "@/quake-os/core/communication";
import type { AgentServiceResult } from "@/quake-os/agents/services/agent-service";
import { serviceResult } from "@/quake-os/agents/services/agent-service";

export const DocumentationAgent = {
  id: "documentation-agent" as const,

  syncDocs() {
    const wavesDir = path.join(REPO_ROOT, "data", "quake-os", "waves");
    const waveFiles = fs.existsSync(wavesDir)
      ? fs.readdirSync(wavesDir).filter((f) => f.endsWith(".md")).sort().reverse()
      : [];
    const latestWave = waveFiles[0] ?? null;
    const openTasks = listTasks({ status: ["pending", "in_progress"] }).length;

    const doc = {
      id: generateId("doc"),
      latestWave,
      openTasks,
      syncedAt: new Date().toISOString(),
      pointers: [
        "docs/PRODUCT-CLAIMS.md",
        "docs/QUAKE-OS.md",
        "quake-os/docs/ARCHITECTURE.md",
      ],
    };

    memoryWrite("lessons", doc, {
      title: "Documentation sync",
      agentId: DocumentationAgent.id,
      tags: ["documentation", "sync"],
    });

    sendMessage({
      from: DocumentationAgent.id,
      to: "ceo-agent",
      subject: "Documentation sync complete",
      body: `Latest wave: ${latestWave ?? "none"}; ${openTasks} open tasks.`,
      refs: [doc.id],
    });

    return doc;
  },

  execute(action: string): AgentServiceResult {
    return serviceResult(DocumentationAgent.id, action, DocumentationAgent.syncDocs());
  },
};
