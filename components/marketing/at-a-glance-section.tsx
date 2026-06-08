/**
 * Marketing section — PulsePoint at a Glance summary lists.
 * Renders PULSE_AT_A_GLANCE from lib/marketing-content.ts.
 */

import { PULSE_AT_A_GLANCE } from "@/lib/marketing-content";

export function AtAGlanceSection() {
  const g = PULSE_AT_A_GLANCE;
  return (
    <section id="at-a-glance" className="border-t border-slate-200 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--pc-navy)]">
          {g.title}
        </h2>
        <h3 className="mt-8 font-semibold text-slate-900">Designed for:</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {g.designedFor.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-sky-500" aria-hidden>
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-semibold text-slate-900">Supports:</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {g.supports.map((item) => (
            <li key={item.text} className="flex gap-2">
              <span className="text-sky-500" aria-hidden>
                •
              </span>
              <span className="flex-1">
                {item.text}
                {item.status === "roadmap" && (
                  <span className="ml-2 text-[10px] font-semibold uppercase text-slate-400">
                    Roadmap
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-semibold text-slate-900">Built with:</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {g.builtWith.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-sky-500" aria-hidden>
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
