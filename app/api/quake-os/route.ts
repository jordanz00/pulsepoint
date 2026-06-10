import { NextResponse } from "next/server";
import { bootstrapOs, getOsStatus } from "@/quake-os/orchestrator/index";
import { runAgent, AGENT_RUNTIMES } from "@/quake-os/agents/runtime";
import { getKnowledgeStatus } from "@/quake-os/knowledge/store";
import { getAmsPlatformSummary } from "@/quake-os/ams/core/services";
import { listExecutions } from "@/quake-os/orchestrator/execution-tracker";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "status";

  bootstrapOs();

  if (view === "agents") {
    return NextResponse.json({ agents: Object.keys(AGENT_RUNTIMES) });
  }

  if (view === "knowledge") {
    return NextResponse.json(getKnowledgeStatus());
  }

  if (view === "ams") {
    return NextResponse.json(getAmsPlatformSummary());
  }

  if (view === "executions") {
    return NextResponse.json({ executions: listExecutions() });
  }

  return NextResponse.json(getOsStatus());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { action?: string; agentId?: string; taskId?: string };

  bootstrapOs();

  if (body.action === "run-agent" && body.agentId) {
    const result = runAgent(body.agentId);
    return NextResponse.json({ agentId: body.agentId, result });
  }

  if (body.action === "discovery") {
    const { runDiscoveryPipeline } = await import("@/quake-os/core/discovery-pipeline");
    const { PAC_MANAGEMENT_DISCOVERY } = await import("@/quake-os/research/discoveries");
    const insight = (body as { insight?: string }).insight;
    const discovery = insight
      ? { ...PAC_MANAGEMENT_DISCOVERY, insight }
      : PAC_MANAGEMENT_DISCOVERY;
    const result = runDiscoveryPipeline(discovery);
    return NextResponse.json(result);
  }

  if (body.action === "feature-review" && body.taskId) {
    const { runFeatureReviewChain } = await import("@/quake-os/core/feature-review-chain");
    const result = runFeatureReviewChain(body.taskId);
    return NextResponse.json(result);
  }

  if (body.action === "complete-task" && body.taskId) {
    const { completeTask } = await import("@/quake-os/agents/runtime");
    const result = completeTask(body.taskId);
    return NextResponse.json(result);
  }

  if (body.action === "corporation-cycle") {
    const { runCorporationCycle } = await import("@/quake-os/orchestrator/corporation-orchestrator");
    const result = runCorporationCycle({
      runGates: process.env.QUAKE_OS_RUN_GATES === "1",
    });
    return NextResponse.json({
      id: result.id,
      boardVerdict: result.executive.boardVerdict,
      taskIds: result.product.taskIds,
      agentsActivated: result.agentsActivated,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
