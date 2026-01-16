import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

// GET /api/mensajes/conversaciones/[conversationId]/mensajes - Obtener mensajes
export async function GET(request: NextRequest, { params }: RouteParams) {
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
      },
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

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages,
      conversation: {
        id: conversation.id,
        vehicleId: conversation.vehicleId,
        buyerId: conversation.buyerId,
        sellerId: conversation.sellerId,
        vehicle: conversation.vehicle,
        buyer: conversation.buyer,
        seller: conversation.seller,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}

// POST /api/mensajes/conversaciones/[conversationId]/mensajes - Enviar mensaje
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

    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = validation.data;

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

    // Determine the recipient and update unread count
    const isBuyer = userId === conversation.buyerId;
    const unreadCountUpdate = isBuyer
      ? { sellerUnreadCount: { increment: 1 } }
      : { buyerUnreadCount: { increment: 1 } };

    // Create message and update conversation in a transaction
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          ...unreadCountUpdate,
          // Unarchive for recipient if it was archived
          ...(isBuyer
            ? { isArchivedBySeller: false }
            : { isArchivedByBuyer: false }),
        },
      }),
    ]);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}
