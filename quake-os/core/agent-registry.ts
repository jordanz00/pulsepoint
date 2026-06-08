/**
 * Quake OS — agent registry loader.
 */
import fs from "node:fs";
import type { AgentId, AgentManifest } from "@/quake-os/core/types";
import { AGENT_REGISTRY_PATH } from "@/quake-os/core/paths";

let cache: AgentManifest[] | null = null;

export function loadAgentRegistry(): AgentManifest[] {
  if (cache) return cache;
  if (!fs.existsSync(AGENT_REGISTRY_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(AGENT_REGISTRY_PATH, "utf8")) as {
    agents: AgentManifest[];
  };
  cache = raw.agents;
  return cache;
}

export function resolveAgentId(id: AgentId): AgentId {
  if (!fs.existsSync(AGENT_REGISTRY_PATH)) return id;
  const raw = JSON.parse(fs.readFileSync(AGENT_REGISTRY_PATH, "utf8")) as {
    _aliases?: Record<string, string>;
  };
  return raw._aliases?.[id] ?? id;
}

export function getAgent(id: AgentId): AgentManifest | undefined {
  return loadAgentRegistry().find((a) => a.id === id);
}

export function listAgentsByDivision(division: string): AgentManifest[] {
  return loadAgentRegistry().filter((a) => a.role.toLowerCase().includes(division.toLowerCase()));
}

export function getAgentIds(): string[] {
  return loadAgentRegistry().map((a) => a.id);
}
