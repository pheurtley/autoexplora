import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TaskPriority, Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, taskId } = await params;
    const body = await request.json();
    const { title, description, assignedToId, dueAt, priority, completedAt } = body;

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

    // Verify task exists and belongs to lead
    const existingTask = await prisma.leadTask.findFirst({
      where: {
        id: taskId,
        leadId: id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    // Build update data
    const updateData: Prisma.LeadTaskUpdateInput = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (assignedToId !== undefined) {
      // Verify assignee belongs to same dealer
      const assignee = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          dealerId: session.user.dealerId,
        },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: "Usuario no encontrado en el equipo" },
          { status: 400 }
        );
      }
      updateData.assignedTo = { connect: { id: assignedToId } };
    }

    if (dueAt !== undefined) {
      updateData.dueAt = new Date(dueAt);
    }

    if (priority !== undefined && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      updateData.priority = priority as TaskPriority;
    }

    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }

    // Update task
    const task = await prisma.leadTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update lead's nextFollowUp based on remaining tasks
    const nextTask = await prisma.leadTask.findFirst({
      where: {
        leadId: id,
        completedAt: null,
      },
      orderBy: { dueAt: "asc" },
    });

    await prisma.dealerLead.update({
      where: { id },
      data: { nextFollowUp: nextTask?.dueAt || null },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Error al actualizar tarea" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, taskId } = await params;

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

    // Verify task exists and belongs to lead
    const task = await prisma.leadTask.findFirst({
      where: {
        id: taskId,
        leadId: id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    await prisma.leadTask.delete({
      where: { id: taskId },
    });

    // Update lead's nextFollowUp
    const nextTask = await prisma.leadTask.findFirst({
      where: {
        leadId: id,
        completedAt: null,
      },
      orderBy: { dueAt: "asc" },
    });

    await prisma.dealerLead.update({
      where: { id },
      data: { nextFollowUp: nextTask?.dueAt || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Error al eliminar tarea" },
      { status: 500 }
    );
  }
}
