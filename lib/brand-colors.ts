/**
 * PulsePoint official brand palette — marketing + product chrome.
 * Module accents derive from these hues (see lib/module-colors.ts).
 */

export const PULSE_BRAND = {
  primary: "#0072bc",
  primaryDark: "#005a96",
  orange: "#fbb040",
  orangeDark: "#c27803",
  ltBlue: "#8ed8f8",
  green: "#00a9a4",
  greenDark: "#007870",
  blue: "#00aeef",
  pink: "#ee2b7b",
} as const;

export type PulseBrandColor = (typeof PULSE_BRAND)[keyof typeof PULSE_BRAND];

/** RGB string for rgba() borders and glass tints */
export const PULSE_BRAND_RGB = {
  primary: "0, 114, 188",
  primaryDark: "0, 90, 150",
  orange: "251, 176, 64",
  ltBlue: "142, 216, 248",
  green: "0, 169, 164",
  blue: "0, 174, 239",
  pink: "238, 43, 123",
} as const;
