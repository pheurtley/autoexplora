import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

// GET /api/mensajes/conversaciones/[conversationId] - Obtener detalle de conversación
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

    // Verify user is part of this conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return NextResponse.json(
        { error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Error al obtener conversación" },
      { status: 500 }
    );
  }
}
