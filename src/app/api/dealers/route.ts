import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DealerStatus, DealerType, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const type = searchParams.get("type") as DealerType | null;
    const regionId = searchParams.get("regionId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DealerWhereInput = {
      status: DealerStatus.ACTIVE,
    };

    if (type) {
      where.type = type;
    }

    if (regionId) {
      where.regionId = regionId;
    }

    if (search) {
      where.OR = [
        { tradeName: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get dealers with count
    const [dealers, total] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          tradeName: true,
          type: true,
          logo: true,
          description: true,
          region: {
            select: { name: true, slug: true },
          },
          comuna: {
            select: { name: true },
          },
          _count: {
            select: {
              vehicles: true,
            },
          },
        },
      }),
      prisma.dealer.count({ where }),
    ]);

    return NextResponse.json({
      dealers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching dealers:", error);
    return NextResponse.json(
      { error: "Error al obtener automotoras" },
      { status: 500 }
    );
  }
}
