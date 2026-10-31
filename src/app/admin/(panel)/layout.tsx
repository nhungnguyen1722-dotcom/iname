import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return <AdminShell title="Quản trị" userName={user.name}>{children}</AdminShell>;
}
