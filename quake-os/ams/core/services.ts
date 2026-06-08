/**
 * Quake OS AMS Core — service layer stubs (tenant-aware patterns).
 */
import { getDomainCoverage, listAmsModules, modulesByPhase } from "@/quake-os/ams/core/modules";
import { createTask } from "@/quake-os/core/task-engine";
import { generateId } from "@/quake-os/core/memory-store";

export function getAmsPlatformSummary() {
  const modules = listAmsModules();
  return {
    totalModules: modules.length,
    live: modulesByPhase("live").length,
    alpha: modulesByPhase("alpha").length,
    foundation: modulesByPhase("foundation").length,
    roadmap: modulesByPhase("roadmap").length,
    domains: getDomainCoverage(),
  };
}

export function seedRoadmapTasksForGaps(): string[] {
  const foundation = modulesByPhase("foundation");
  const ids: string[] = [];
  for (const mod of foundation.slice(0, 3)) {
    const task = createTask({
      id: generateId("task"),
      title: `Advance ${mod.title} to alpha`,
      description: mod.summary,
      priority: "P2",
      businessImpact: "high",
      technicalComplexity: "high",
      dependencies: [],
      ownerAgent: "developer-agent",
      researchSources: [],
      acceptanceCriteria: [
        "Module phase updated in docs/PRODUCT-CLAIMS.md",
        "Feature ships with tenant guards",
        "Task completion audit passes",
      ],
      tags: ["ams-core", mod.id],
    });
    ids.push(task.id);
  }
  return ids;
}
