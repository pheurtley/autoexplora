import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get user with dealer info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dealerId: true },
    });

    if (!user?.dealerId) {
      return NextResponse.json(
        { error: "No tienes una cuenta de concesionario" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as ListingStatus | null;
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause - filter by dealerId
    const where: {
      dealerId: string;
      status?: ListingStatus;
      OR?: Array<{ title?: { contains: string; mode: "insensitive" } }>;
    } = {
      dealerId: user.dealerId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get vehicles with count
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          year: true,
          status: true,
          views: true,
          publishedAt: true,
          brand: { select: { name: true } },
          model: { select: { name: true } },
          region: { select: { name: true } },
          images: {
            select: { url: true },
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching dealer vehicles:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos" },
      { status: 500 }
    );
  }
}
