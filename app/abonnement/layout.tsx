import { WorkspaceShell } from "@/components/WorkspaceShell";

export default function SubscriptionLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
