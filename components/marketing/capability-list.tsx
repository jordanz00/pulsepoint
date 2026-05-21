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
      <h3 className="mt-8 font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.text} className="flex gap-2 text-sm text-slate-600">
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
    </div>
  );
}
