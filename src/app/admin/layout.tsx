import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { AdminLayoutClient } from "@/components/admin";

export const metadata: Metadata = {
  title: "Panel de Administración | AutoExplora.cl",
  description: "Panel de administración de AutoExplora.cl",
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

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
