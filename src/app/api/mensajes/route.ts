import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/mensajes - Listar conversaciones del usuario
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

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId, isArchivedByBuyer: false },
          { sellerId: userId, isArchivedBySeller: false },
        ],
      },
      include: {
        vehicle: {
          select: {
            id: true,
            slug: true,
            title: true,
            price: true,
            images: {
              take: 1,
              orderBy: { order: "asc" },
              select: { url: true, isPrimary: true },
            },
            brand: { select: { name: true } },
            model: { select: { name: true } },
          },
        },
        buyer: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, name: true, image: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Transform to include lastMessage at root level
    const transformedConversations = conversations.map((conv) => ({
      ...conv,
      lastMessage: conv.messages[0] || null,
      messages: undefined,
    }));

    return NextResponse.json({
      conversations: transformedConversations,
      total: transformedConversations.length,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Error al obtener conversaciones" },
      { status: 500 }
    );
  }
}
