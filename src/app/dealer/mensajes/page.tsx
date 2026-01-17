import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/chat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mensajes | Panel Concesionario | AutoExplora.cl",
};

export default async function DealerMensajesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dealer/mensajes");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mensajes</h1>
          <p className="text-neutral-600 mt-1">
            Gestiona las consultas de tus clientes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <ConversationList currentUserId={session.user.id} basePath="/dealer/mensajes" />
      </div>
    </div>
  );
}
