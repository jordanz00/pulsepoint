/**
 * Consistent section intro for the marketing landing page — eyebrow, title, optional lead.
 */

export function MarketingSectionHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  titleId,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  titleId?: string;
  className?: string;
}) {
  return (
    <header
      className={`mk-section-intro ${align === "left" ? "mk-section-intro--left !max-w-none" : ""} ${className}`.trim()}
    >
      {eyebrow ? <p className="mk-section-eyebrow">{eyebrow}</p> : null}
      <h2 id={titleId} className="mk-section-title mk-section-title--display">
        {title}
      </h2>
      {lead ? <p className="mk-section-lead">{lead}</p> : null}
    </header>
  );
}
