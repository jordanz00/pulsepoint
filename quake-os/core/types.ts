/**
 * Quake OS — core communication and task primitives.
 */

export type AgentId = string;

export type TaskPriority = "P0" | "P1" | "P2" | "P3";
export type TaskStatus = "pending" | "in_progress" | "blocked" | "review" | "done" | "cancelled";
export type AuditVerdict = "APPROVED" | "NEEDS_REVISION" | "REJECTED";

export type AgentMessage = {
  id: string;
  from: AgentId;
  to: AgentId | "broadcast";
  subject: string;
  body: string;
  refs?: string[];
  createdAt: string;
};

export type AgentTask = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  businessImpact: "critical" | "high" | "medium" | "low";
  technicalComplexity: "low" | "medium" | "high";
  dependencies: string[];
  ownerAgent: AgentId;
  status: TaskStatus;
  researchSources: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  division?: string;
  human?: boolean;
};

export type AgentDecision = {
  id: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string[];
  decidedBy: AgentId;
  status: "proposed" | "accepted" | "superseded";
  createdAt: string;
};

export type AgentAudit = {
  id: string;
  subject: string;
  subjectType: "research" | "architecture" | "feature" | "documentation" | "security";
  reviewer: AgentId;
  verdict: AuditVerdict;
  findings: { level: "pass" | "warn" | "fail"; module: string; note: string }[];
  recommendations: string[];
  createdAt: string;
};

export type AgentResearch = {
  id: string;
  topic: string;
  category:
    | "hospital_association"
    | "healthcare_association"
    | "health_system"
    | "nonprofit"
    | "competitor"
    | "ai_trends"
    | "membership"
    | "events"
    | "fundraising"
    | "advocacy"
    | "ams_market";
  summary: string;
  sources: string[];
  recommendations: string[];
  authorAgent: AgentId;
  createdAt: string;
};

export type AgentRecommendation = {
  id: string;
  title: string;
  rationale: string;
  proposedBy: AgentId;
  targetAgents: AgentId[];
  linkedTaskIds: string[];
  priority: TaskPriority;
  createdAt: string;
};

export type AgentManifest = {
  id: AgentId;
  name: string;
  role: string;
  objectives: string[];
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  memoryAccess: string[];
  communicationMethods: ("message" | "task" | "audit" | "research")[];
  auditResponsibilities: string[];
  performanceMetrics: string[];
  cursorAgent?: string;
};

export type WorkflowStep = {
  id: string;
  agentId: AgentId;
  action: string;
  required: boolean;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  schedule?: "daily" | "weekly" | "on_feature_complete" | "on_demand";
  steps: WorkflowStep[];
};

export type KnowledgeNodeType =
  | "organization"
  | "member"
  | "event"
  | "committee"
  | "legislation"
  | "advocacy_issue"
  | "hospital"
  | "health_system"
  | "sponsor"
  | "vendor"
  | "feature"
  | "requirement"
  | "agent"
  | "research";

export type KnowledgeNode = {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  metadata?: Record<string, string | number | boolean>;
};

export type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
};

export type KnowledgeGraph = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  updatedAt: string;
};

export type MemoryCategory =
  | "research"
  | "requirements"
  | "decisions"
  | "roadmaps"
  | "lessons"
  | "competitors"
  | "tasks"
  | "audits"
  | "messages"
  | "recommendations";

export type MemoryIndexEntry = {
  id: string;
  category: MemoryCategory;
  title: string;
  agentId?: AgentId;
  createdAt: string;
  path: string;
  tags?: string[];
};

export type MemoryIndex = {
  version: 1;
  updatedAt: string;
  entries: MemoryIndexEntry[];
};

export type WaveReport = {
  id: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  tasksPicked: string[];
  agentsActivated: AgentId[];
  gatesPassed: boolean;
  auditVerdict?: AuditVerdict;
  notes: string[];
};
