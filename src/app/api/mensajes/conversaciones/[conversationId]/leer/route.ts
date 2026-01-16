import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

// POST /api/mensajes/conversaciones/[conversationId]/leer - Marcar mensajes como leídos
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { conversationId } = await params;
    const userId = session.user.id;

    // Verify conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    const isBuyer = userId === conversation.buyerId;

    // Mark all unread messages as read and reset unread count
    await prisma.$transaction([
      // Mark messages as read
      prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      }),
      // Reset unread count for the current user
      prisma.conversation.update({
        where: { id: conversationId },
        data: isBuyer
          ? { buyerUnreadCount: 0 }
          : { sellerUnreadCount: 0 },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Error al marcar mensajes como leídos" },
      { status: 500 }
    );
  }
}
