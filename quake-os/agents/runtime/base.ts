/**
 * Quake OS — agent runtime base class.
 */
import type { AgentManifest } from "@/quake-os/core/types";
import { getAgent } from "@/quake-os/core/agent-registry";
import { sendMessage } from "@/quake-os/core/communication";

export abstract class BaseAgent {
  abstract readonly id: string;

  get manifest(): AgentManifest | undefined {
    return getAgent(this.id);
  }

  protected notify(to: string, subject: string, body: string, refs?: string[]): void {
    sendMessage({ from: this.id, to, subject, body, refs });
  }

  abstract execute(input?: Record<string, unknown>): unknown;
}
