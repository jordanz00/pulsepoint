import Link from "next/link";
import type { AdvocacyIssueTemplate } from "@/lib/advocacy/issue-templates";
import { resolveToolkitPath } from "@/lib/advocacy/issue-media";
import { AdvocacyIssueHeroMedia } from "@/components/advocacy/advocacy-issue-hero-media";

type Props = {
  orgSlug: string;
  orgName: string;
  issueTitle: string;
  template: AdvocacyIssueTemplate;
  takeActionCampaignId?: string | null;
};

/** Rich public advocacy issue layout — hero media, toolkit, take-action CTA. */
export function AdvocacyIssuePublicShowcase({
  orgSlug,
  orgName,
  issueTitle,
  template,
  takeActionCampaignId,
}: Props) {
  const story = template.storyParagraphs ?? [];
  const impacts = template.impactBullets ?? [];
  const toolkitPath = resolveToolkitPath(template.toolkitPath);

  return (
    <div className="pp-advocacy-issue-showcase">
      <span className="badge-alpha mb-4 inline-block">Alpha · illustrative preview</span>

      <AdvocacyIssueHeroMedia
        title={issueTitle}
        heroVideoUrl={template.heroVideoUrl}
        heroImageUrl={template.heroImageUrl}
      />

      <div className="pp-advocacy-showcase__hero glass pp-glass-surface">
        <p className="pp-eyebrow">Association advocacy</p>
        <h1 className="pp-advocacy-showcase__title">{issueTitle}</h1>
        <p className="pp-advocacy-showcase__summary">{template.summary}</p>
        <p className="pp-advocacy-showcase__disclaimer" role="note">
          Illustrative preview — association policy staff must review before external use. No
          unverified statistics or legal claims.
        </p>
      </div>

      {toolkitPath ? (
        <section className="pp-advocacy-showcase__toolkit glass pp-glass-surface">
          <h2 className="pp-advocacy-showcase__h2">Member hospital toolkit</h2>
          <p className="pp-advocacy-showcase__p">
            One-page brief for hospital leaders. Open and use Print → Save as PDF for a downloadable
            copy.
          </p>
          <a
            href={toolkitPath}
            className="pc-btn-primary inline-flex mt-3"
            target="_blank"
            rel="noopener noreferrer"
          >
            {template.toolkitLabel ?? "Download toolkit"}
          </a>
        </section>
      ) : null}

      {story.length > 0 ? (
        <section className="pp-advocacy-showcase__section glass pp-glass-surface">
          <h2 className="pp-advocacy-showcase__h2">The story for your members</h2>
          {story.map((p) => (
            <p key={p.slice(0, 40)} className="pp-advocacy-showcase__p">
              {p}
            </p>
          ))}
        </section>
      ) : null}

      <div className="pp-advocacy-showcase__grid">
        <section className="pp-advocacy-showcase__section glass pp-glass-surface">
          <h2 className="pp-advocacy-showcase__h2">Why it matters</h2>
          <p className="pp-advocacy-showcase__p">{template.memberNeed}</p>
          {impacts.length > 0 ? (
            <ul className="pp-advocacy-showcase__list">
              {impacts.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="pp-advocacy-showcase__section glass pp-glass-surface">
          <h2 className="pp-advocacy-showcase__h2">How staff run the campaign</h2>
          <p className="pp-advocacy-showcase__p">{template.staffWorkflow}</p>
          <p className="pp-advocacy-showcase__meta">
            Modules: {template.pulseModules.join(" · ")}
          </p>
          {template.ceOpportunity ? (
            <p className="pp-advocacy-showcase__meta">{template.ceOpportunity}</p>
          ) : null}
        </section>
      </div>

      {template.suggestedKpis.length > 0 ? (
        <section className="pp-advocacy-showcase__kpis" aria-label="Suggested KPIs">
          {template.suggestedKpis.map((k) => (
            <div key={k.label} className="pp-advocacy-showcase__kpi glass pp-glass-surface">
              <span className="pp-advocacy-showcase__kpi-label">{k.label}</span>
              <span className="pp-advocacy-showcase__kpi-pending">Track when live</span>
            </div>
          ))}
        </section>
      ) : null}

      <div className="pp-advocacy-showcase__ctas">
        {takeActionCampaignId ? (
          <Link
            href={`/${orgSlug}/advocacy/${takeActionCampaignId}`}
            className="pc-btn-primary"
          >
            Take action — hospital sign-on
          </Link>
        ) : (
          <Link href={`/${orgSlug}/enterprise/advocacy`} className="pc-btn-primary">
            Contact association staff
          </Link>
        )}
        <Link href={`/${orgSlug}/learn/workforce`} className="pc-btn-secondary">
          Explore workforce programs
        </Link>
        <Link href={`/${orgSlug}/enterprise/advocacy/issues`} className="pc-btn-secondary">
          Issue hub (staff)
        </Link>
      </div>
      <p className="text-xs text-[var(--fg-muted)] mt-4">
        {orgName} · PulsePoint Advocacy (alpha)
      </p>
    </div>
  );
}
