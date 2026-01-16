import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get user with dealer info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dealerId: true },
    });

    if (!user?.dealerId) {
      return NextResponse.json(
        { error: "No tienes una cuenta de concesionario" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Find vehicle and verify it belongs to this dealer
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, dealerId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.dealerId !== user.dealerId) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este vehículo" },
        { status: 403 }
      );
    }

    // Update vehicle status
    const { status } = body;

    if (status && !Object.values(ListingStatus).includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        status: status as ListingStatus,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: "Vehículo actualizado",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Error updating dealer vehicle:", error);
    return NextResponse.json(
      { error: "Error al actualizar vehículo" },
      { status: 500 }
    );
  }
}
