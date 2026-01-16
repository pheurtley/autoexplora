import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/marcas/populares - Obtener marcas con más vehículos
export async function GET() {
  try {
    // Obtener marcas con conteo de vehículos activos, ordenadas por cantidad
    const brands = await prisma.brand.findMany({
      where: {
        vehicles: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: {
          select: {
            vehicles: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
      orderBy: {
        vehicles: {
          _count: "desc",
        },
      },
      take: 12,
    });

    // Transformar la respuesta para incluir el conteo de manera más limpia
    const popularBrands = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      vehicleCount: brand._count.vehicles,
    }));

    return NextResponse.json({ brands: popularBrands });
  } catch (error) {
    console.error("Error fetching popular brands:", error);
    return NextResponse.json(
      { error: "Error al obtener marcas populares" },
      { status: 500 }
    );
  }
}
