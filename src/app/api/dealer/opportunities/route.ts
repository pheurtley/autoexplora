import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OpportunityStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const where: Prisma.OpportunityWhereInput = {
      lead: { dealerId: session.user.dealerId },
    };

    if (status && status !== "all" && Object.values(OpportunityStatus).includes(status as OpportunityStatus)) {
      where.status = status as OpportunityStatus;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Error al obtener oportunidades" },
      { status: 500 }
    );
  }
}
