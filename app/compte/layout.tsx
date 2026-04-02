import { WorkspaceShell } from "@/components/WorkspaceShell";

export default function AccountLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
