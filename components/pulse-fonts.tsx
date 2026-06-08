import { Inter, Lexend } from "next/font/google";

export const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const fontDisplay = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const fontClassNames = `${fontBody.variable} ${fontDisplay.variable}`;
