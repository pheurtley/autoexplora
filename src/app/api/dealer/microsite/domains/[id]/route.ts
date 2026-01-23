import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);
    const { id } = await params;

    // Verify domain belongs to this dealer
    const domain = await prisma.dealerDomain.findFirst({
      where: {
        id,
        siteConfig: { dealerId: dealer.id },
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Dominio no encontrado" }, { status: 404 });
    }

    await prisma.dealerDomain.delete({ where: { id } });

    return NextResponse.json({ message: "Dominio eliminado" });
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
    console.error("Error deleting domain:", error);
    return NextResponse.json({ error: "Error al eliminar dominio" }, { status: 500 });
  }
}
