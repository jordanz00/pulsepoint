/**
 * PulsePoint design tokens — mirrors :root in app/globals.css.
 *
 * Use for JS/TS (charts, emails, Storybook). Prefer CSS variables in components.
 * See docs/DESIGN-PRINCIPLES.md for philosophy and usage.
 */

export const SPACING = {
  0: "2px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "48px",
  8: "64px",
  9: "128px",
} as const;

export const MOTION = {
  fast: "150ms",
  medium: "250ms",
  slow: "400ms",
} as const;

export const Z_INDEX = {
  header: 100,
  dropdown: 600,
  modal: 800,
  overlay: 999,
} as const;

/** Liquid glass — see app/globals.css and docs/DESIGN-PRINCIPLES.md */
export const GLASS = {
  blurChrome: "var(--glass-blur-chrome)",
  blurPanel: "var(--glass-blur-panel)",
  blurSubtle: "var(--glass-blur-subtle)",
  bgChrome: "var(--glass-bg-chrome)",
  bgPanel: "var(--glass-bg-panel)",
  bgSubtle: "var(--glass-bg-subtle)",
  border: "var(--glass-border)",
} as const;

/** Semantic colours — navy + sky/cyan, Apple-style liquid glass */
export const PULSE_DESIGN = {
  colors: {
    navy: "var(--navy-900)",
    navySidebar: "var(--pc-sidebar-bg)",
    accent: "var(--accent-brand)",
    accentHover: "var(--accent-brand-hover)",
    accentMuted: "var(--accent-brand-muted)",
    accentSoft: "var(--accent-brand-soft)",
    canvas: "var(--bg-canvas)",
    surface: "var(--bg-surface)",
    elevated: "var(--bg-elevated)",
    text: "var(--fg-default)",
    textSecondary: "var(--fg-muted)",
    textTertiary: "var(--fg-subtle)",
    textOnAccent: "var(--fg-on-accent)",
    border: "var(--border-muted)",
    borderStrong: "var(--border-strong)",
    success: "var(--accent-positive)",
    warning: "var(--accent-warning)",
    error: "var(--accent-danger)",
  },
  fonts: {
    sans: "var(--font-body, var(--font-body-fallback))",
    display: "var(--font-display, var(--font-display-fallback))",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  typography: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
    proseMax: "75ch",
  },
  spacing: SPACING,
  motion: MOTION,
  zIndex: Z_INDEX,
} as const;
