import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`ds-input min-h-[120px] resize-y py-3 ${className}`.trim()}
      {...props}
    />
  );
}
