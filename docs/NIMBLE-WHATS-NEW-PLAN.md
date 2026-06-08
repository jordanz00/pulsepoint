# Nimble What's New → PulsePoint implementation plan

Source: [Nimble What's New](https://www.nimble.com/whats-new/) (May 2026). **Excluded:** Web Chat with AI Helper, AI Email Marketing, AI-assisted features.

## Top 5 selected (worth implementing)

| Priority | Nimble feature | PulsePoint module | Rationale |
|----------|----------------|-------------------|-----------|
| 1 | **Email Sequences** | PulsePoint Engage / CRM | No multi-step outreach today; high ROI for membership & sales follow-up |
| 2 | **Web Forms + post-submission email** | CRM Web Forms | Extends capture API into hosted forms + auto thank-you (Nimble post-submission) |
| 3 | **Workflow stage automation** | CRM Workflows | Nimble “Workflow Automation” — triggers when card moves stage |
| 4 | **Multiple pipelines + move deals** | PulsePoint Deals | Schema exists; unlock drag/move + second pipeline (Nimble deal updates) |
| 5 | **Lead qualification board** | CRM Workflows | Nimble lead board → qualified lead becomes deal (convert action) |

**Not in this wave (already live or lower priority):** Bulk contact editing (already in MemberCore), PhoneBurner integration, full webhook chain, email reminders (partial via sequences step 0).

## Execution checklist

- [x] Prisma models: `EmailSequence*`, `WebForm*`, `CrmWorkflow.stageAutomations`
- [x] Email sequences: actions, templates, `/engage/sequences` UI
- [x] Web forms: admin builder, public submit API + `/forms/[org]/[slug]` page, confirmation email
- [x] Workflow automation on `moveWorkflowRunToStage`
- [x] Deal `createDeal`, `moveDealStage`, interactive pipeline board
- [x] Lead qualification template + `convertWorkflowLeadToDeal` + kanban button
- [x] What's New marketing page at `/whats-new` + demo seed data
- [x] Server action export fixes (`crm.ts` re-exports, `deal-reports` types)
