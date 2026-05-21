import { BETTER_EXPERIENCES } from "@/lib/marketing-content";
import type { CapabilityItem } from "@/lib/marketing-content";

export function BetterExperiencesSection() {
  const b = BETTER_EXPERIENCES;

  return (
    <section className="py-16">
      <h2 className="text-center text-2xl font-bold text-[var(--pc-navy)]">
        {b.title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">{b.lead}</p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <ExperienceColumn title={b.membersTitle} items={b.membersItems} />
        <ExperienceColumn title={b.staffTitle} items={b.staffItems} />
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-slate-600">{b.closer}</p>
    </section>
  );
}

function ExperienceColumn({
  title,
  items,
}: {
  title: string;
  items: CapabilityItem[];
}) {
  return (
    <div className="pc-card">
      <h3 className="font-semibold text-[var(--pc-navy)]">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.text} className="flex gap-2 text-sm text-slate-600">
            <span className="text-sky-500">✓</span>
            <span>
              {item.text}
              {item.status === "roadmap" && (
                <span className="ml-1 text-[10px] font-semibold uppercase text-slate-400">
                  Roadmap
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
