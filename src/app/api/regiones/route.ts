import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/regiones - Obtener todas las regiones con comunas
export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        comunas: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Error al obtener regiones" },
      { status: 500 }
    );
  }
}
