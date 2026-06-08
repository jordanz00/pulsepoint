"use client";

import { useCallback, useId, useState, type KeyboardEvent } from "react";
import { FAQ_ITEMS } from "@/lib/marketing-content";
import { MARKETING_SECTIONS } from "@/lib/marketing-home";
import { MarketingSectionHeader } from "@/components/marketing/marketing-section-header";

export function FaqAccordion() {
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(FAQ_ITEMS[0]?.question ?? null);

  const focusTrigger = useCallback(
    (index: number) => {
      const el = document.getElementById(`${baseId}-trigger-${index}`);
      el?.focus();
    },
    [baseId],
  );

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = FAQ_ITEMS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusTrigger((index + 1) % count);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusTrigger((index - 1 + count) % count);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTrigger(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTrigger(count - 1);
    }
  }

  const s = MARKETING_SECTIONS.faq;
  return (
    <section id="faq" className="mk-section" aria-labelledby={`${baseId}-title`}>
      <div className="mk-container max-w-3xl">
        <MarketingSectionHeader
          eyebrow={s.eyebrow}
          title={s.title}
          lead={s.lead}
          titleId={`${baseId}-title`}
        />
        <div className="mk-faq-panel mk-section-body divide-y divide-[color-mix(in_srgb,var(--border-muted)_55%,transparent)] overflow-hidden rounded-[var(--radius-2xl)]">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = open === item.question;
            const panelId = `${baseId}-panel-${index}`;
            const triggerId = `${baseId}-trigger-${index}`;
            return (
              <div key={item.question}>
                <h3 className="m-0">
                  <button
                    id={triggerId}
                    type="button"
                    className="flex w-full min-h-11 items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 ease-out hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent-brand)]"
                    onClick={() => setOpen(isOpen ? null : item.question)}
                    onKeyDown={(e) => onTriggerKeyDown(e, index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="text-[15px] font-semibold tracking-[-0.012em] text-[var(--fg-default)]">
                      {item.question}
                    </span>
                    <span
                      className="shrink-0 text-xl font-light text-[var(--fg-subtle)]"
                      aria-hidden
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!isOpen}
                  className={
                    isOpen
                      ? "border-t border-[color-mix(in_srgb,var(--border-muted)_55%,transparent)] px-7 pb-6 pt-4"
                      : undefined
                  }
                >
                  {isOpen ? (
                    <div className="pc-prose text-[15px] leading-[1.65] text-[var(--fg-muted)]">
                      <p>{item.answer}</p>
                      {"bullets" in item && item.bullets?.length ? (
                        <ul className="mk-faq-bullets mt-4 space-y-2.5">
                          {item.bullets.map((line) => (
                            <li key={line} className="mk-faq-bullet flex gap-3">
                              <span className="mk-capability-check mt-0.5 shrink-0" aria-hidden>
                                ✓
                              </span>
                              <span className="font-medium text-[var(--readable-on-light-fg)]">
                                {line}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
