import Link from "next/link";
import type { CeoReviewItem } from "@/lib/ceo-command-center-data";
import { EnterpriseStatePanel } from "@/components/enterprise/enterprise-state-panel";

const PRIORITY_LABEL: Record<CeoReviewItem["priority"], string> = {
  high: "Needs decision",
  medium: "Review",
  low: "Clear",
};

export function CeoReviewQueue({ items }: { items: CeoReviewItem[] }) {
  return (
    <section className="ceo-review-queue ds-card ds-glass" aria-label="Executive review queue">
      <header className="ceo-panel__head">
        <div>
          <p className="ceo-panel__eyebrow">Executive review</p>
          <h2 className="ceo-panel__title">Actions requiring attention</h2>
        </div>
        <span className="ceo-review-queue__count">{items.length}</span>
      </header>
      {items.length === 0 ? (
        <EnterpriseStatePanel
          variant="clear"
          title="Queue clear"
          description="Intelligence found no items requiring executive review right now."
          className="ceo-review-queue__empty-panel"
        />
      ) : (
        <ul className="ceo-review-queue__list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="ceo-review-queue__item">
                <span className={`ceo-review-queue__priority ceo-review-queue__priority--${item.priority}`}>
                  {PRIORITY_LABEL[item.priority]}
                </span>
                <span className="ceo-review-queue__title">{item.title}</span>
                <span className="ceo-review-queue__summary">{item.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
