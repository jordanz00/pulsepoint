type BadgeVariant = "live" | "roadmap" | "neutral" | "warning";

const styles: Record<BadgeVariant, string> = {
  live: "bg-[var(--hap-blue-muted)] text-[var(--hap-blue)] ring-1 ring-[var(--pc-border-strong)]",
  roadmap: "bg-[var(--pc-bg-subtle)] text-[var(--hap-gray-teal)] ring-1 ring-[var(--pc-border)]",
  neutral: "bg-white/10 text-slate-200 ring-1 ring-white/20",
  warning: "bg-[var(--pc-warm-muted)] text-[var(--hap-black)] ring-1 ring-[var(--hap-warm)]/40",
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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
