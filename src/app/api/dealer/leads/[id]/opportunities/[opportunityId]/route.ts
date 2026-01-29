import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OpportunityStatus, LeadStatus, Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; opportunityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, opportunityId } = await params;
    const body = await request.json();

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

    // Verify opportunity exists
    const existingOpportunity = await prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        leadId: id,
      },
    });

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Prisma.OpportunityUpdateInput = {};

    if (body.vehicleId !== undefined) {
      if (body.vehicleId) {
        // Verify vehicle belongs to dealer
        const vehicle = await prisma.vehicle.findFirst({
          where: {
            id: body.vehicleId,
            dealerId: session.user.dealerId,
          },
        });

        if (!vehicle) {
          return NextResponse.json(
            { error: "Vehículo no encontrado" },
            { status: 400 }
          );
        }
        updateData.vehicle = { connect: { id: body.vehicleId } };
      } else {
        updateData.vehicle = { disconnect: true };
      }
    }

    if (body.estimatedValue !== undefined) {
      updateData.estimatedValue = body.estimatedValue;
    }

    if (body.probability !== undefined) {
      updateData.probability = body.probability;
    }

    if (body.expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = body.expectedCloseDate
        ? new Date(body.expectedCloseDate)
        : null;
    }

    if (body.status !== undefined && Object.values(OpportunityStatus).includes(body.status as OpportunityStatus)) {
      updateData.status = body.status as OpportunityStatus;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null;
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: updateData,
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

    // Update lead status if opportunity is won/lost
    if (body.status === "WON") {
      await prisma.dealerLead.update({
        where: { id },
        data: { status: LeadStatus.CONVERTED },
      });
    } else if (body.status === "LOST") {
      await prisma.dealerLead.update({
        where: { id },
        data: { status: LeadStatus.LOST },
      });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Error updating opportunity:", error);
    return NextResponse.json(
      { error: "Error al actualizar oportunidad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; opportunityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, opportunityId } = await params;

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

    // Verify opportunity exists
    const opportunity = await prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        leadId: id,
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }

    await prisma.opportunity.delete({
      where: { id: opportunityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return NextResponse.json(
      { error: "Error al eliminar oportunidad" },
      { status: 500 }
    );
  }
}
