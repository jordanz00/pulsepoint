/**
 * Quake OS — agent-to-agent communication bus.
 */
import type { AgentId, AgentMessage, AgentRecommendation } from "@/quake-os/core/types";
import { generateId, memoryList, memoryRead, memoryWrite } from "@/quake-os/core/memory-store";

export function sendMessage(input: {
  from: AgentId;
  to: AgentId | "broadcast";
  subject: string;
  body: string;
  refs?: string[];
}): AgentMessage {
  const msg: AgentMessage = {
    id: generateId("msg"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  return memoryWrite("messages", msg, { title: input.subject, agentId: input.from });
}

export function getMessagesFor(agentId: AgentId): AgentMessage[] {
  return memoryList<AgentMessage>("messages").filter(
    (m) => m.to === agentId || m.to === "broadcast",
  );
}

export function requestReview(input: {
  from: AgentId;
  to: AgentId;
  subject: string;
  artifactId: string;
  artifactType: string;
}): AgentMessage {
  return sendMessage({
    from: input.from,
    to: input.to,
    subject: `Review requested: ${input.subject}`,
    body: `Please review ${input.artifactType} ${input.artifactId}.`,
    refs: [input.artifactId],
  });
}

export function escalateIssue(input: {
  from: AgentId;
  to: AgentId;
  issue: string;
  taskId?: string;
}): AgentMessage {
  return sendMessage({
    from: input.from,
    to: input.to,
    subject: `Escalation: ${input.issue.slice(0, 80)}`,
    body: input.issue,
    refs: input.taskId ? [input.taskId] : undefined,
  });
}

export function publishRecommendation(input: Omit<AgentRecommendation, "id" | "createdAt">): AgentRecommendation {
  const rec: AgentRecommendation = {
    id: generateId("rec"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  return memoryWrite("recommendations", rec, { title: input.title, agentId: input.proposedBy });
}

export function getRecommendation(id: string): AgentRecommendation | null {
  return memoryRead("recommendations", id);
}
