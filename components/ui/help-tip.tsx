"use client";

import type { ReactNode } from "react";
import { useCallback, useId } from "react";

/**
 * Contextual help — plain-language explanations for non-technical staff.
 * Appendix pattern: show on hover (fine pointer) + focus; dismiss with Escape.
 */
export function HelpTip({
  text,
  children,
  side = "bottom",
}: {
  text: string;
  children?: ReactNode;
  side?: "bottom" | "right";
}) {
  const tooltipId = useId();

  const dismiss = useCallback((el: HTMLElement) => {
    el.blur();
  }, []);

  return (
    <span
      className={`pc-help-tip group relative inline-flex align-middle ${side === "right" ? "pc-help-tip--right" : ""}`}
    >
      {children ?? (
        <button
          type="button"
          className="pc-help-tip-trigger"
          aria-describedby={tooltipId}
          aria-label="More information"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              dismiss(e.currentTarget);
            }
          }}
        >
          ?
        </button>
      )}
      <span id={tooltipId} className="pc-help-tip-panel" role="tooltip">
        {text}
      </span>
    </span>
  );
}
