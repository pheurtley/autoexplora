import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VehicleType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/marcas/[id]/modelos - Obtener modelos de una marca
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: brandId } = await params;
    const vehicleType = request.nextUrl.searchParams.get("vehicleType");
    const validTypes = Object.values(VehicleType);

    // Verificar que la marca existe
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marca no encontrada" },
        { status: 404 }
      );
    }

    const where: { brandId: string; vehicleTypes?: { has: VehicleType } } = { brandId };
    if (vehicleType && validTypes.includes(vehicleType as VehicleType)) {
      where.vehicleTypes = { has: vehicleType as VehicleType };
    }

    const models = await prisma.model.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    return NextResponse.json({ models, brand: { id: brand.id, name: brand.name } });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Error al obtener modelos" },
      { status: 500 }
    );
  }
}
