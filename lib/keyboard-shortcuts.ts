/**
 * Global keyboard shortcuts for the admin shell.
 */

export type ShortcutHandler = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  handler: () => void;
};

function eventMatches(
  e: KeyboardEvent,
  spec: { key: string; meta?: boolean; ctrl?: boolean; shift?: boolean },
): boolean {
  const key = e.key.toLowerCase();
  if (key !== spec.key.toLowerCase()) return false;
  if (Boolean(spec.meta) !== (e.metaKey || e.ctrlKey)) return false;
  if (Boolean(spec.shift) !== e.shiftKey) return false;
  return true;
}

export function registerKeyboardShortcuts(handlers: ShortcutHandler[]): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    if (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      target?.isContentEditable
    ) {
      if (e.key !== "Escape") return;
    }

    for (const spec of handlers) {
      if (eventMatches(e, spec)) {
        e.preventDefault();
        spec.handler();
        return;
      }
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}

export const SHORTCUT_LABELS = {
  commandPalette: "⌘K",
  addMember: "⌘N",
  export: "⌘E",
  help: "⌘/",
} as const;
