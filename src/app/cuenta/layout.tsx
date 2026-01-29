import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout";
import { AccountSidebar } from "@/components/cuenta/AccountSidebar";

export const metadata: Metadata = {
  title: "Mi Cuenta | AutoExplora.cl",
  robots: { index: false, follow: false },
};

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta");
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <Container>
        <div className="flex flex-col md:flex-row gap-6">
          <AccountSidebar
            userName={session.user.name}
            userEmail={session.user.email}
          />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </Container>
    </div>
  );
}
