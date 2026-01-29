import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notifyFollowUpReminder } from "@/lib/notifications";

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

    const tasks = await prisma.leadTask.findMany({
      where: { leadId: id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { completedAt: "asc" }, // Pending first
        { dueAt: "asc" },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Error al obtener tareas" },
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
    const { title, description, assignedToId, dueAt, priority } = body;

    // Validate required fields
    if (!title || !assignedToId || !dueAt) {
      return NextResponse.json(
        { error: "Título, asignado y fecha son requeridos" },
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

    // Create task
    const task = await prisma.leadTask.create({
      data: {
        leadId: id,
        assignedToId,
        title: title.trim(),
        description: description?.trim() || null,
        dueAt: new Date(dueAt),
        priority: priority || "MEDIUM",
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update lead's nextFollowUp if this task is earlier
    const updateFollowUp =
      !lead.nextFollowUp || new Date(dueAt) < new Date(lead.nextFollowUp);

    if (updateFollowUp) {
      await prisma.dealerLead.update({
        where: { id },
        data: { nextFollowUp: new Date(dueAt) },
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Error al crear tarea" },
      { status: 500 }
    );
  }
}
