type BadgeVariant = "live" | "roadmap" | "neutral" | "warning";

const styles: Record<BadgeVariant, string> = {
  live: "bg-sky-100 text-sky-800 ring-1 ring-sky-200/60",
  roadmap: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
  neutral: "bg-white/10 text-slate-200 ring-1 ring-white/20",
  warning: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/60",
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
