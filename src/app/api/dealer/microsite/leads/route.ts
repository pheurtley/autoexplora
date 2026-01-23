import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";

export async function GET() {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);

    const leads = await prisma.dealerLead.findMany({
      where: { dealerId: dealer.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        vehicle: {
          select: { title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof DealerPendingError || error instanceof DealerInactiveError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Error al obtener leads" }, { status: 500 });
  }
}
