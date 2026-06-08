import type { Member360Profile } from "@/lib/member-360";
import type { EnrichmentSuggestion } from "@/lib/crm/enrichment";
import type { FirmographicProfile } from "@/lib/crm/prospector-enrichment";

export type ContactRecordNote = {
  id: string;
  body: string;
  noteType: string;
  channel: string | null;
  createdAt: Date;
  authorName: string | null;
  nextFollowUpAt: Date | null;
};

export type ContactRecordDeal = {
  id: string;
  title: string;
  stage: string;
  amountCents: number;
  pipelineName: string;
  updatedAt: Date;
};

export type ContactRecordWorkflowRun = {
  id: string;
  workflowId: string;
  workflowName: string;
  stageLabel: string;
};

export type ContactRecordRelationship = {
  id: string;
  label: string;
  relationType: string;
  otherMemberId: string;
};

export type ContactRecordSource = {
  id: string;
  sourceKind: string;
  label: string;
  capturedAt: Date;
};

export type ContactRecordData = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    status: string;
    company: string | null;
    jobTitle: string | null;
    linkedInUrl: string | null;
    websiteUrl: string | null;
    relationshipHealth: string;
    lastTouchAt: Date | null;
    nextFollowUpAt: Date | null;
    joinedAt: Date;
    engagementScore: number;
    engagementTier: string;
  };
  tags: string[];
  profile360: Member360Profile | null;
  notes: ContactRecordNote[];
  deals: ContactRecordDeal[];
  workflowRuns: ContactRecordWorkflowRun[];
  relationships: ContactRecordRelationship[];
  sources: ContactRecordSource[];
  firmographics: FirmographicProfile | null;
  enrichmentSuggestions: EnrichmentSuggestion[];
  pipelines: { id: string; name: string }[];
  workflows: { id: string; name: string; department: string }[];
};

export type ContactRecordTab =
  | "interactions"
  | "data"
  | "company"
  | "social"
  | "integrations"
  | "files";

export const CONTACT_RECORD_TABS: { id: ContactRecordTab; label: string }[] = [
  { id: "interactions", label: "Interactions" },
  { id: "data", label: "Data fields" },
  { id: "company", label: "Company info" },
  { id: "social", label: "Social" },
  { id: "integrations", label: "Integrations" },
  { id: "files", label: "Files" },
];

export type InlineEditableField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "company"
  | "jobTitle"
  | "linkedInUrl"
  | "websiteUrl"
  | "relationshipHealth";
