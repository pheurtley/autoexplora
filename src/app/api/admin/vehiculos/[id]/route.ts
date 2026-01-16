import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get vehicle details for admin
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: true,
        model: true,
        region: true,
        comuna: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            bannedAt: true,
            _count: { select: { vehicles: true } },
          },
        },
        images: { orderBy: { order: "asc" } },
        moderatedBy: { select: { id: true, name: true, email: true } },
        reports: {
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener vehículo" },
      { status: 500 }
    );
  }
}

// Moderate vehicle (approve, reject, pause, feature, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const admin = await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { action, reason, featured } = body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Build update data based on action
    const updateData: Record<string, unknown> = {
      moderatedById: admin.id,
      moderatedAt: new Date(),
    };

    switch (action) {
      case "approve":
        updateData.status = ListingStatus.ACTIVE;
        updateData.rejectionReason = null;
        break;

      case "reject":
        if (!reason) {
          return NextResponse.json(
            { error: "Debes proporcionar una razón para rechazar" },
            { status: 400 }
          );
        }
        updateData.status = ListingStatus.REJECTED;
        updateData.rejectionReason = reason;
        break;

      case "pause":
        updateData.status = ListingStatus.PAUSED;
        break;

      case "unpause":
        updateData.status = ListingStatus.ACTIVE;
        break;

      case "feature":
        updateData.featured = true;
        break;

      case "unfeature":
        updateData.featured = false;
        break;

      case "setStatus":
        if (!body.status || !Object.values(ListingStatus).includes(body.status)) {
          return NextResponse.json(
            { error: "Estado inválido" },
            { status: 400 }
          );
        }
        updateData.status = body.status;
        if (body.status === ListingStatus.REJECTED && reason) {
          updateData.rejectionReason = reason;
        }
        break;

      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 }
        );
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error("Error moderating vehicle:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al moderar vehículo" },
      { status: 500 }
    );
  }
}

// Delete vehicle
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar vehículo" },
      { status: 500 }
    );
  }
}
