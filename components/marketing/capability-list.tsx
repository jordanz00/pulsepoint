import type { CapabilityItem } from "@/lib/marketing-content";

export function CapabilityList({
  title,
  items,
  className = "",
}: {
  title: string;
  items: CapabilityItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.012em] text-[var(--fg-default)]">
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.text} className="flex gap-2 text-sm leading-[1.55] text-[var(--fg-muted)]">
            <span className="text-[var(--pill-active-text)]" aria-hidden>
              •
            </span>
            <span className="flex-1">
              {item.text}
              {item.status === "roadmap" ? (
                <span className="badge-roadmap ml-2">Coming soon</span>
              ) : item.status === "alpha" ? (
                <span className="badge-alpha ml-2">Preview</span>
              ) : item.status === "available" ? (
                <span className="badge-live ml-2">Live</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
