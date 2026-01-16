import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin";

export const metadata: Metadata = {
  title: "Panel de Administración | PortalAndino",
  description: "Panel de administración de PortalAndino",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verify admin access
  const hasAccess = await isAdmin(session);
  if (!hasAccess) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
