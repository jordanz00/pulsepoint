/**
 * Tenant-scoped models — every row carries orgId.
 * getOrgDb auto-injects orgId on read/write for these.
 */

export const ORG_SCOPED_MODELS = [
  "Member",
  "MemberRole",
  "MemberTier",
  "MemberNote",
  "MemberRelationship",
  "ContactSource",
  "CrmWorkflow",
  "CrmWorkflowRun",
  "WebCaptureKey",
  "DealPipeline",
  "DealLossReason",
  "Deal",
  "DealReportDashboard",
  "DealReportWidget",
  "MemberImportBatch",
  "MemberImportRow",
  "Event",
  "EventRegistration",
  "AuditLog",
  "AutomationException",
  // Roadmap modules — alpha
  "CECreditType",
  "Course",
  "CourseEnrollment",
  "CECreditAward",
  "LearnVideoPlaylist",
  "LearnVideoItem",
  "LearnWorkforceProgram",
  "LearnProgramEnrollment",
  "CommerceProduct",
  "CommerceOrder",
  "CommerceOrderItem",
  "Campaign",
  "Donation",
  "EmailTemplate",
  "EmailAudience",
  "EmailCampaign",
  "EmailSendLog",
  "EmailSequence",
  "EmailSequenceStep",
  "EmailSequenceEnrollment",
  "WebForm",
  "WebFormSubmission",
  "InsightsSnapshot",
  "MemberOrganization",
  "Committee",
  "CommitteeMembership",
  "CommitteeMeeting",
  "AdvocacyIssue",
  "AdvocacyCampaign",
  "EmergencyContact",
  "EmergencyReadinessReport",
  "IntegrationConnection",
] as const;

export type OrgScopedModel = (typeof ORG_SCOPED_MODELS)[number];

export function isOrgScopedModel(model: string | undefined): boolean {
  if (!model) return false;
  return (ORG_SCOPED_MODELS as readonly string[]).includes(model);
}
