/**
 * Quake OS — centralized knowledge graph.
 */
import fs from "node:fs";
import type { KnowledgeEdge, KnowledgeGraph, KnowledgeNode, KnowledgeNodeType } from "@/quake-os/core/types";
import { generateId } from "@/quake-os/core/memory-store";
import { KNOWLEDGE_GRAPH_PATH } from "@/quake-os/core/paths";

function readGraph(): KnowledgeGraph {
  if (!fs.existsSync(KNOWLEDGE_GRAPH_PATH)) {
    return { nodes: [], edges: [], updatedAt: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(KNOWLEDGE_GRAPH_PATH, "utf8")) as KnowledgeGraph;
}

function writeGraph(graph: KnowledgeGraph): void {
  graph.updatedAt = new Date().toISOString();
  const dir = KNOWLEDGE_GRAPH_PATH.replace(/\/[^/]+$/, "");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(KNOWLEDGE_GRAPH_PATH, JSON.stringify(graph, null, 2));
}

export function upsertNode(input: {
  id?: string;
  type: KnowledgeNodeType;
  label: string;
  metadata?: Record<string, string | number | boolean>;
}): KnowledgeNode {
  const graph = readGraph();
  const id = input.id ?? generateId(input.type.slice(0, 4));
  const existing = graph.nodes.findIndex((n) => n.id === id);
  const node: KnowledgeNode = { id, type: input.type, label: input.label, metadata: input.metadata };
  if (existing >= 0) graph.nodes[existing] = node;
  else graph.nodes.push(node);
  writeGraph(graph);
  return node;
}

export function linkNodes(from: string, to: string, relation: string): KnowledgeEdge {
  const graph = readGraph();
  const existing = graph.edges.find(
    (e) => e.from === from && e.to === to && e.relation === relation,
  );
  if (existing) return existing;
  const edge: KnowledgeEdge = { id: generateId("edge"), from, to, relation };
  graph.edges.push(edge);
  writeGraph(graph);
  return edge;
}

/** Replace relation between two nodes (dedupes duplicate edges from repeated seeds). */
export function setEdgeRelation(from: string, to: string, relation: string): KnowledgeEdge {
  const graph = readGraph();
  graph.edges = graph.edges.filter((e) => !(e.from === from && e.to === to));
  const edge: KnowledgeEdge = { id: generateId("edge"), from, to, relation };
  graph.edges.push(edge);
  writeGraph(graph);
  return edge;
}

export function getGraph(): KnowledgeGraph {
  return readGraph();
}

export function getNeighbors(nodeId: string): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const graph = readGraph();
  const edges = graph.edges.filter((e) => e.from === nodeId || e.to === nodeId);
  const ids = new Set<string>();
  for (const e of edges) {
    ids.add(e.from);
    ids.add(e.to);
  }
  const nodes = graph.nodes.filter((n) => ids.has(n.id));
  return { nodes, edges };
}

export function seedKnowledgeGraph(): KnowledgeGraph {
  const features = [
    { id: "feat-membership", label: "Membership Management" },
    { id: "feat-advocacy", label: "Advocacy Management" },
    { id: "feat-events", label: "Event Management" },
    { id: "feat-crm", label: "CRM" },
    { id: "feat-giving", label: "Fundraising / Giving" },
    { id: "feat-learning", label: "Learning / CE" },
    { id: "feat-engage", label: "Email / Engage" },
  ];

  for (const f of features) {
    upsertNode({ id: f.id, type: "feature", label: f.label });
  }

  upsertNode({ id: "org-hospital-assoc", type: "organization", label: "State Hospital Association" });
  upsertNode({ id: "org-health-system", type: "health_system", label: "Multi-Hospital Health System" });
  upsertNode({ id: "agent-hospital", type: "agent", label: "Hospital Association Agent" });
  upsertNode({ id: "req-take-action", type: "requirement", label: "Public take-action form" });
  upsertNode({ id: "leg-pa-340b", type: "legislation", label: "PA 340B Policy Context" });

  linkNodes("org-hospital-assoc", "feat-advocacy", "requires");
  linkNodes("org-hospital-assoc", "feat-membership", "requires");
  linkNodes("org-health-system", "feat-membership", "requires");
  setEdgeRelation("feat-advocacy", "req-take-action", "implements");
  linkNodes("agent-hospital", "feat-advocacy", "reviews");
  linkNodes("feat-advocacy", "leg-pa-340b", "tracks");

  return getGraph();
}
