import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeadStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DealerLeadWhereInput = {
      dealerId: session.user.dealerId,
    };

    if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      where.status = status as LeadStatus;
    }

    if (assignedTo === "me") {
      where.assignedToId = session.user.id;
    } else if (assignedTo === "unassigned") {
      where.assignedToId = null;
    } else if (assignedTo && assignedTo !== "all") {
      where.assignedToId = assignedTo;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.dealerLead.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.dealerLead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500 }
    );
  }
}
