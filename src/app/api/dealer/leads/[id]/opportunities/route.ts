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

    const opportunities = await prisma.opportunity.findMany({
      where: { leadId: id },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Error al obtener oportunidades" },
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
    const { vehicleId, estimatedValue, probability, expectedCloseDate, notes } = body;

    // Validate required fields
    if (!estimatedValue || estimatedValue <= 0) {
      return NextResponse.json(
        { error: "Valor estimado es requerido" },
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

    // Verify vehicle belongs to dealer if provided
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          dealerId: session.user.dealerId,
        },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehículo no encontrado" },
          { status: 400 }
        );
      }
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        leadId: id,
        vehicleId: vehicleId || null,
        estimatedValue,
        probability: probability || 50,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes: notes?.trim() || null,
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

    // Update lead's estimated value
    await prisma.dealerLead.update({
      where: { id },
      data: { estimatedValue },
    });

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    console.error("Error creating opportunity:", error);
    return NextResponse.json(
      { error: "Error al crear oportunidad" },
      { status: 500 }
    );
  }
}
