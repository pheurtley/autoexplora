import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/mensajes/no-leidos - Contador de mensajes no leídos
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get unread counts as buyer
    const buyerConversations = await prisma.conversation.findMany({
      where: {
        buyerId: userId,
        isArchivedByBuyer: false,
        buyerUnreadCount: { gt: 0 },
      },
      select: { buyerUnreadCount: true },
    });

    // Get unread counts as seller
    const sellerConversations = await prisma.conversation.findMany({
      where: {
        sellerId: userId,
        isArchivedBySeller: false,
        sellerUnreadCount: { gt: 0 },
      },
      select: { sellerUnreadCount: true },
    });

    const asBuyer = buyerConversations.reduce(
      (sum: number, conv: { buyerUnreadCount: number }) => sum + conv.buyerUnreadCount,
      0
    );
    const asSeller = sellerConversations.reduce(
      (sum: number, conv: { sellerUnreadCount: number }) => sum + conv.sellerUnreadCount,
      0
    );

    return NextResponse.json({
      total: asBuyer + asSeller,
      asBuyer,
      asSeller,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Error al obtener mensajes no leídos" },
      { status: 500 }
    );
  }
}
