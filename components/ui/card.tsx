import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "raised" | "flat";
  padding?: "none" | "md" | "lg";
};

export function Card({
  children,
  variant = "raised",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const shell = `ds-card ds-glass${variant === "flat" ? " ds-card--flat" : ""} ${className}`.trim();

  if (padding === "none") {
    return (
      <div className={shell} {...props}>
        {children}
      </div>
    );
  }

  const bodyClass = padding === "lg" ? "ds-card__body ds-card__body--lg" : "ds-card__body";
  return (
    <div className={shell} {...props}>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ds-card__head flex items-center justify-between gap-4 ${className}`.trim()}>
      <h2 className="ds-card__title m-0">{title}</h2>
      {action}
    </div>
  );
}
