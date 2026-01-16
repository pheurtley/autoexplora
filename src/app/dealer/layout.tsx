import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DealerSidebar } from "@/components/dealer/DealerSidebar";

export const metadata: Metadata = {
  title: "Panel de Concesionario | PortalAndino",
  description: "Gestiona tu concesionario en PortalAndino",
};

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verify authentication
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dealer");
  }

  // Get user with dealer info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      dealerId: true,
      dealerRole: true,
      dealer: {
        select: {
          id: true,
          tradeName: true,
          logo: true,
          status: true,
        },
      },
    },
  });

  // Verify user has a dealer account
  if (!user?.dealer) {
    redirect("/registro/concesionario");
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <DealerSidebar dealer={user.dealer} userRole={user.dealerRole} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
