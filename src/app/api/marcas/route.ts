import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VehicleType } from "@prisma/client";

// GET /api/marcas - Obtener marcas, opcionalmente filtradas por tipo de vehículo
export async function GET(request: NextRequest) {
  try {
    const vehicleType = request.nextUrl.searchParams.get("vehicleType");
    const validTypes = Object.values(VehicleType);

    const where = vehicleType && validTypes.includes(vehicleType as VehicleType)
      ? { vehicles: { some: { vehicleType: vehicleType as VehicleType, status: "ACTIVE" as const } } }
      : undefined;

    const brands = await prisma.brand.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Error al obtener marcas" },
      { status: 500 }
    );
  }
}
