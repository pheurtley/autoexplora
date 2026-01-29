import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadStatus, LeadActivityType, Prisma } from "@prisma/client";
import { notifyLeadAssignment, notifyLeadStatusChange } from "@/lib/notifications";
import { sendLeadAssignedNotification } from "@/lib/lead-notifications";

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

    const lead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Error al obtener lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { status, assignedToId, notes, estimatedValue, nextFollowUp } = body;

    // Verify lead belongs to dealer
    const existingLead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
      include: {
        vehicle: { select: { title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    // Build update data
    const updateData: Prisma.DealerLeadUpdateInput = {};

    // Track what changed for activity log
    const activities: Prisma.LeadActivityCreateManyInput[] = [];

    // Status change
    if (status && status !== existingLead.status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      updateData.status = status as LeadStatus;

      // Create activity for status change
      activities.push({
        leadId: id,
        userId: session.user.id,
        type: LeadActivityType.STATUS_CHANGE,
        content: null,
        metadata: {
          oldStatus: existingLead.status,
          newStatus: status,
        },
      });

      // If status is CONTACTED, update lastContactAt
      if (status === "CONTACTED" && existingLead.status === "NEW") {
        updateData.lastContactAt = new Date();
      }
    }

    // Assignment change
    if (assignedToId !== undefined && assignedToId !== existingLead.assignedToId) {
      // Verify assignee belongs to same dealer if not null
      if (assignedToId) {
        const assignee = await prisma.user.findFirst({
          where: {
            id: assignedToId,
            dealerId: session.user.dealerId,
          },
          select: { id: true, name: true, email: true },
        });

        if (!assignee) {
          return NextResponse.json(
            { error: "Usuario no encontrado en el equipo" },
            { status: 400 }
          );
        }

        updateData.assignedTo = { connect: { id: assignedToId } };

        // Create activity for assignment
        activities.push({
          leadId: id,
          userId: session.user.id,
          type: LeadActivityType.ASSIGNMENT,
          content: null,
          metadata: {
            oldAssigneeId: existingLead.assignedToId,
            newAssigneeId: assignedToId,
            assignedToName: assignee.name,
          },
        });

        // Send notification to assignee (if different from current user)
        if (assignedToId !== session.user.id) {
          // In-app notification
          await notifyLeadAssignment(
            assignedToId,
            existingLead.name,
            session.user.name || "Un compañero",
            id
          );

          // Email notification
          if (assignee.email) {
            await sendLeadAssignedNotification(
              assignee.email,
              assignee.name || "Usuario",
              session.user.name || "Un compañero",
              {
                id: existingLead.id,
                name: existingLead.name,
                email: existingLead.email,
                phone: existingLead.phone,
                message: existingLead.message,
                vehicleTitle: existingLead.vehicle?.title,
              }
            );
          }
        }
      } else {
        updateData.assignedTo = { disconnect: true };

        activities.push({
          leadId: id,
          userId: session.user.id,
          type: LeadActivityType.ASSIGNMENT,
          content: null,
          metadata: {
            oldAssigneeId: existingLead.assignedToId,
            newAssigneeId: null,
            assignedToName: "Sin asignar",
          },
        });
      }
    }

    // Other fields
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (estimatedValue !== undefined) {
      updateData.estimatedValue = estimatedValue;
    }

    if (nextFollowUp !== undefined) {
      updateData.nextFollowUp = nextFollowUp ? new Date(nextFollowUp) : null;
    }

    // Perform update
    const [lead] = await Promise.all([
      prisma.dealerLead.update({
        where: { id },
        data: updateData,
        include: {
          vehicle: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      // Create activities
      activities.length > 0
        ? prisma.leadActivity.createMany({ data: activities })
        : Promise.resolve(),
    ]);

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Error al actualizar lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.dealerLead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Error al eliminar lead" },
      { status: 500 }
    );
  }
}
