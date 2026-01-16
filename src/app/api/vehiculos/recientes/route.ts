import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/vehiculos/recientes - Obtener vehículos más recientes
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: "ACTIVE",
      },
      take: 8,
      orderBy: {
        publishedAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        year: true,
        mileage: true,
        fuelType: true,
        transmission: true,
        condition: true,
        featured: true,
        contactWhatsApp: true,
        publishedAt: true,
        brand: {
          select: {
            name: true,
            slug: true,
          },
        },
        model: {
          select: {
            name: true,
            slug: true,
          },
        },
        region: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            url: true,
            isPrimary: true,
          },
          orderBy: {
            order: "asc",
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Error fetching recent vehicles:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos recientes" },
      { status: 500 }
    );
  }
}
