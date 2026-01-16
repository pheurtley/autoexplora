import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/marcas/[id]/modelos - Obtener modelos de una marca
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: brandId } = await params;

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

    const models = await prisma.model.findMany({
      where: { brandId },
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
