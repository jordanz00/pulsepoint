"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "pp-flagship-act-gap", label: "Compare" },
  { id: "pp-flagship-act-product", label: "Product" },
  { id: "pp-flagship-act-proof", label: "Demo" },
] as const;

export function WhyPulsePointChapterNav() {
  const [active, setActive] = useState<string>(CHAPTERS[0]!.id);

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (id) setActive(id);
      },
      { rootMargin: "-25% 0px -50% 0px", threshold: [0.15, 0.4, 0.65] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="pp-flagship-chapters" aria-label="Why PulsePoint chapters">
      <ol className="pp-flagship-chapters-list">
        {CHAPTERS.map((chapter, i) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={`pp-flagship-chapter-link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="pp-flagship-chapter-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="pp-flagship-chapter-label">{chapter.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
