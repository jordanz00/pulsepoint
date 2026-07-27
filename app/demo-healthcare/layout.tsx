import { StaticDemoShell } from "@/components/static-demo/static-demo-shell";

export default function StaticDemoHealthcareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaticDemoShell>{children}</StaticDemoShell>;
}
