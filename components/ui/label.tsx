import type { LabelHTMLAttributes } from "react";

export function Label({
  className = "",
  required,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={`ds-label ${className}`.trim()} {...props}>
      {children}
      {required ? (
        <span className="text-[var(--ds-fg-muted)]" aria-hidden>
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}
