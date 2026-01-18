import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerStatus, DealerType, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as DealerStatus | null;
    const type = searchParams.get("type") as DealerType | null;
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DealerWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { tradeName: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { rut: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get dealers with counts
    const [dealers, total, statusCounts] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          region: {
            select: { name: true },
          },
          _count: {
            select: {
              vehicles: true,
              users: true,
            },
          },
        },
      }),
      prisma.dealer.count({ where }),
      prisma.dealer.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    // Transform status counts
    const counts = {
      PENDING: 0,
      ACTIVE: 0,
      SUSPENDED: 0,
      REJECTED: 0,
    };
    statusCounts.forEach((item) => {
      counts[item.status] = item._count.status;
    });

    return NextResponse.json({
      dealers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Error fetching dealers for admin:", error);
    return NextResponse.json(
      { error: "Error al obtener automotoras" },
      { status: 500 }
    );
  }
}
