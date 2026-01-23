import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";

interface RouteParams {
  params: Promise<{ id: string; domainId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId, domainId } = await params;

    const domain = await prisma.dealerDomain.findFirst({
      where: {
        id: domainId,
        siteConfig: { dealerId },
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Dominio no encontrado" }, { status: 404 });
    }

    await prisma.dealerDomain.delete({ where: { id: domainId } });

    return NextResponse.json({ message: "Dominio eliminado" });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting domain:", error);
    return NextResponse.json({ error: "Error al eliminar dominio" }, { status: 500 });
  }
}
