"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#why-pulsepoint", label: "Why PulsePoint" },
  { href: "#features", label: "Modules" },
  { href: "#healthcare", label: "Healthcare" },
  { href: "#security", label: "Security" },
  { href: "#demo", label: "Demo" },
  { href: "#faq", label: "FAQ" },
] as const;

export function MarketingJumpNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string>("#why-pulsepoint");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (!visibleEntries.length) return;
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visibleEntries[0]?.target.id;
        if (top) setActive(`#${top}`);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`pp-marketing-jump-nav${visible ? " pp-marketing-jump-nav--visible" : ""}`}
      aria-label="Page sections"
    >
      <div className="mk-container pp-marketing-jump-nav-inner">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`pp-marketing-jump-nav-link${active === link.href ? " is-active" : ""}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
