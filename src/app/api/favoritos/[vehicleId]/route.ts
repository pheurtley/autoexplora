import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ vehicleId: string }>;
}

// DELETE /api/favoritos/[vehicleId] - Quitar favorito
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { vehicleId } = await params;

    // Buscar el favorito
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId: session.user.id,
          vehicleId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorito no encontrado" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ message: "Favorito eliminado" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Error al eliminar favorito" },
      { status: 500 }
    );
  }
}
