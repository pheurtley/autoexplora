import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ChatWindow } from "@/components/chat";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { conversationId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return { title: "Chat | Panel Automotora | AutoExplora.cl" };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      vehicle: { select: { title: true } },
      buyer: { select: { name: true } },
      seller: { select: { name: true } },
    },
  });

  if (!conversation) {
    return { title: "Conversación no encontrada | AutoExplora.cl" };
  }

  const isBuyer = session.user.id === conversation.buyerId;
  const otherUser = isBuyer ? conversation.seller : conversation.buyer;

  return {
    title: `Chat con ${otherUser.name || "Usuario"} | Panel Automotora | AutoExplora.cl`,
  };
}

export default async function DealerConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const session = await auth();

  // Verify conversation exists and user has access
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    notFound();
  }

  // Verify user is part of this conversation
  if (
    conversation.buyerId !== session!.user!.id &&
    conversation.sellerId !== session!.user!.id
  ) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <ChatWindow
        conversationId={conversationId}
        currentUserId={session!.user!.id}
        basePath="/dealer/mensajes"
        isDealer={true}
      />
    </div>
  );
}
