import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseCore — Association management",
  description:
    "Multi-tenant healthcare association management: members, events, and member portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-white text-zinc-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
