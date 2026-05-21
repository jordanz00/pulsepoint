/**
 * HAP corporate brand tokens — April 2025 guidelines.
 *
 * Source: HAP-Branding-Guidelines-April-2025-updated.pdf
 * (Primary / complimentary / black-white palette + typography rules.)
 *
 * PulsePoint maps these into CSS variables in app/globals.css as --pc-*.
 * Do not invent hex values here; keep in sync with the PDF.
 */

export const HAP_BRAND = {
  colors: {
    primary: {
      warm: "#fbb040",
      blue: "#0072bc",
      lightBlue: "#8ed8f8",
    },
    complimentary: {
      teal: "#3a8b7f",
      grayTeal: "#6d8b8c",
      lightGray: "#d3d9d4",
    },
    neutral: {
      black: "#231f20",
      white: "#ffffff",
    },
  },
  fonts: {
    /** Digital communications (memos, email, web) */
    sans: 'Tahoma, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    /** Headlines / display (Montserrat when loaded) */
    display: '"Montserrat", Tahoma, "Segoe UI", sans-serif',
    /** Formal correspondence (PDF/print) — not default for PulsePoint UI */
    serif: 'Georgia, "Times New Roman", Times, serif',
  },
  pdf: "HAP-Branding-Guidelines-April-2025-updated.pdf",
} as const;
