import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verify lead belongs to dealer
    const lead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, content, metadata } = body;

    // Validate type
    const validTypes = ["NOTE", "CALL", "EMAIL", "WHATSAPP", "TEST_DRIVE"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo de actividad inválido" },
        { status: 400 }
      );
    }

    // Verify lead belongs to dealer
    const lead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    // Create activity
    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type,
        content: content?.trim() || null,
        metadata: metadata || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update lastContactAt if it's a contact activity
    if (["CALL", "EMAIL", "WHATSAPP"].includes(type)) {
      await prisma.dealerLead.update({
        where: { id },
        data: { lastContactAt: new Date() },
      });
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Error al crear actividad" },
      { status: 500 }
    );
  }
}
