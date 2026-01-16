import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/chat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Mensajes | PortalAndino",
};

export default async function MisMensajesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/cuenta/mensajes");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mis Mensajes</h1>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <ConversationList currentUserId={session.user.id} />
      </div>
    </div>
  );
}
