import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell adminName={admin.name} role={admin.role}>
      {children}
    </AdminShell>
  );
}
