/**
 * One-section preview for alpha modules in easy/demo mode.
 */
export function SimplePreviewList({
  items,
  emptyMessage = "No records yet.",
}: {
  items: { id: string; title: string; detail: string }[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-[var(--pc-text-secondary)]">{emptyMessage}</p>;
  }
  return (
    <ul className="pc-simple-list">
      {items.map((item, idx) => (
        <li
          key={item.id}
          className={`px-6 py-4 ${idx < items.length - 1 ? "border-b border-[color-mix(in_srgb,var(--pc-border)_55%,transparent)]" : ""}`}
        >
          <p className="font-medium tracking-[-0.005em] text-[var(--pc-text)]">{item.title}</p>
          <p className="mt-1 text-sm leading-[1.5] text-[var(--pc-text-secondary)]">
            {item.detail}
          </p>
        </li>
      ))}
    </ul>
  );
}
