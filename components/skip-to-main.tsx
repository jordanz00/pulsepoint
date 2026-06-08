export function SkipToMain({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a href={`#${targetId}`} className="pp-skip-link">
      Skip to main content
    </a>
  );
}
