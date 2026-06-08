type BadgeVariant = "live" | "alpha" | "roadmap" | "neutral" | "warning";

const styles: Record<BadgeVariant, string> = {
  live: "bg-[var(--accent-brand)] text-white shadow-[0_1px_2px_rgba(14,165,233,0.28)]",
  alpha: "bg-white/70 text-[var(--fg-muted)] ring-1 ring-[var(--glass-border)] backdrop-blur",
  roadmap: "bg-white/55 text-[var(--fg-subtle)] ring-1 ring-[var(--glass-border)] backdrop-blur",
  neutral: "bg-white/70 text-[var(--fg-muted)] ring-1 ring-[var(--glass-border)] backdrop-blur",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
