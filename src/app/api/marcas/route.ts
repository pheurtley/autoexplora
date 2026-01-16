import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/marcas - Obtener todas las marcas
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
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
