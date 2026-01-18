import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { dealerApproveSchema } from "@/lib/validations/dealer";
import { DealerStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: {
        region: true,
        comuna: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            dealerRole: true,
            createdAt: true,
          },
        },
        vehicles: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            price: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            vehicles: true,
            users: true,
          },
        },
      },
    });

    if (!dealer) {
      return NextResponse.json(
        { error: "Automotora no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ dealer });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Error fetching dealer for admin:", error);
    return NextResponse.json(
      { error: "Error al obtener la automotora" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = dealerApproveSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Find dealer
    const dealer = await prisma.dealer.findUnique({
      where: { id },
    });

    if (!dealer) {
      return NextResponse.json(
        { error: "Automotora no encontrada" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Parameters<typeof prisma.dealer.update>[0]["data"] = {
      status: data.status,
    };

    if (data.status === DealerStatus.ACTIVE) {
      updateData.verifiedAt = new Date();
      updateData.rejectionReason = null;
    } else if (data.status === DealerStatus.REJECTED) {
      updateData.rejectionReason = data.rejectionReason || null;
    } else if (data.status === DealerStatus.SUSPENDED) {
      updateData.rejectionReason = data.rejectionReason || null;
    }

    const updatedDealer = await prisma.dealer.update({
      where: { id },
      data: updateData,
      include: {
        region: true,
        comuna: true,
      },
    });

    // TODO: Send notification email to dealer

    return NextResponse.json({
      message: getStatusMessage(data.status),
      dealer: updatedDealer,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Error updating dealer status:", error);
    return NextResponse.json(
      { error: "Error al actualizar la automotora" },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: DealerStatus): string {
  switch (status) {
    case DealerStatus.ACTIVE:
      return "Automotora aprobada correctamente";
    case DealerStatus.REJECTED:
      return "Automotora rechazada";
    case DealerStatus.SUSPENDED:
      return "Automotora suspendida";
    default:
      return "Estado actualizado";
  }
}
