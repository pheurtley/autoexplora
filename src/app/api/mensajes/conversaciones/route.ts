import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createConversationSchema } from "@/lib/validations";

// POST /api/mensajes/conversaciones - Crear o obtener conversación
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { vehicleId } = validation.data;
    const buyerId = session.user.id;

    // Get the vehicle and seller info
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId, status: "ACTIVE" },
      select: { id: true, userId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado o no disponible" },
        { status: 404 }
      );
    }

    // Can't start a conversation with yourself
    if (vehicle.userId === buyerId) {
      return NextResponse.json(
        { error: "No puedes enviar mensajes sobre tu propio vehículo" },
        { status: 400 }
      );
    }

    const sellerId = vehicle.userId;

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        buyerId_vehicleId: {
          buyerId,
          vehicleId,
        },
      },
    });

    if (existingConversation) {
      // Unarchive if it was archived by the buyer
      if (existingConversation.isArchivedByBuyer) {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { isArchivedByBuyer: false },
        });
      }

      return NextResponse.json({
        conversationId: existingConversation.id,
        isNew: false,
      });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        vehicleId,
        buyerId,
        sellerId,
      },
    });

    return NextResponse.json(
      {
        conversationId: newConversation.id,
        isNew: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Error al crear conversación" },
      { status: 500 }
    );
  }
}
