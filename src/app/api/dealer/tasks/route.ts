import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get("assignedTo");
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    // Build where clause
    const where: {
      lead: { dealerId: string };
      assignedToId?: string;
      completedAt?: null | { not: null };
    } = {
      lead: { dealerId: session.user.dealerId },
    };

    if (assignedTo === "me") {
      where.assignedToId = session.user.id;
    } else if (assignedTo && assignedTo !== "all") {
      where.assignedToId = assignedTo;
    }

    if (!includeCompleted) {
      where.completedAt = null;
    }

    const tasks = await prisma.leadTask.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ dueAt: "asc" }],
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
