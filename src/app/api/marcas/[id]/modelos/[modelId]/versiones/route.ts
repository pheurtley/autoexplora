import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; modelId: string }>;
}

// GET /api/marcas/[id]/modelos/[modelId]/versiones - Obtener versiones de un modelo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: brandId, modelId } = await params;

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

    // Verificar que el modelo existe y pertenece a la marca
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        brandId: brandId
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Modelo no encontrado" },
        { status: 404 }
      );
    }

    const versions = await prisma.version.findMany({
      where: { modelId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        engineSize: true,
        horsePower: true,
        transmission: true,
        drivetrain: true,
        trimLevel: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    return NextResponse.json({
      versions,
      model: { id: model.id, name: model.name },
      brand: { id: brand.id, name: brand.name }
    });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Error al obtener versiones" },
      { status: 500 }
    );
  }
}
