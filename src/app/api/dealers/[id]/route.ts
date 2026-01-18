import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DealerStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Try to find by slug first, then by id
    const dealer = await prisma.dealer.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
        status: DealerStatus.ACTIVE,
      },
      include: {
        region: true,
        comuna: true,
        vehicles: {
          where: { status: "ACTIVE" },
          take: 20,
          orderBy: { publishedAt: "desc" },
          include: {
            brand: true,
            model: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            region: true,
          },
        },
        _count: {
          select: {
            vehicles: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!dealer) {
      return NextResponse.json(
        { error: "Automotora no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ dealer });
  } catch (error) {
    console.error("Error fetching dealer:", error);
    return NextResponse.json(
      { error: "Error al obtener la automotora" },
      { status: 500 }
    );
  }
}
