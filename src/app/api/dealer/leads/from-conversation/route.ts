import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadStatus, LeadSource } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId es requerido" },
        { status: 400 }
      );
    }

    // Get conversation with all necessary data
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            dealerId: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            content: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    // Verify the conversation is for a vehicle from this dealer
    if (conversation.vehicle.dealerId !== session.user.dealerId) {
      return NextResponse.json(
        { error: "No autorizado para esta conversación" },
        { status: 403 }
      );
    }

    // Check if a lead already exists for this conversation
    const existingLead = await prisma.dealerLead.findFirst({
      where: {
        conversationId: conversationId,
        dealerId: session.user.dealerId,
      },
    });

    if (existingLead) {
      return NextResponse.json(
        {
          error: "Ya existe un lead para esta conversación",
          leadId: existingLead.id
        },
        { status: 409 }
      );
    }

    // Check for duplicate leads (same email or phone in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const duplicateCheck = await prisma.dealerLead.findFirst({
      where: {
        dealerId: session.user.dealerId,
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { email: conversation.buyer.email || "" },
          ...(conversation.buyer.phone
            ? [{ phone: conversation.buyer.phone }]
            : []),
        ],
      },
    });

    const isDuplicate = !!duplicateCheck;

    // Get first message as the lead message
    const firstMessage = conversation.messages[0]?.content || "Consulta desde chat";

    // Create the lead
    const lead = await prisma.dealerLead.create({
      data: {
        dealerId: session.user.dealerId,
        vehicleId: conversation.vehicle.id,
        conversationId: conversationId,
        name: conversation.buyer.name || "Usuario",
        email: conversation.buyer.email || "",
        phone: conversation.buyer.phone,
        message: firstMessage,
        source: LeadSource.CHAT,
        status: LeadStatus.NEW,
        isDuplicate,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      lead,
      message: "Lead creado exitosamente"
    });
  } catch (error) {
    console.error("Error creating lead from conversation:", error);
    return NextResponse.json(
      { error: "Error al crear lead" },
      { status: 500 }
    );
  }
}

// Check if a lead exists for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId es requerido" },
        { status: 400 }
      );
    }

    const lead = await prisma.dealerLead.findFirst({
      where: {
        conversationId: conversationId,
        dealerId: session.user.dealerId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      exists: !!lead,
      lead
    });
  } catch (error) {
    console.error("Error checking lead:", error);
    return NextResponse.json(
      { error: "Error al verificar lead" },
      { status: 500 }
    );
  }
}
