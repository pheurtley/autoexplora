import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);
    const { id } = await params;

    // Verify page belongs to this dealer
    const existing = await prisma.dealerPage.findFirst({
      where: {
        id,
        siteConfig: { dealerId: dealer.id },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      "title",
      "slug",
      "content",
      "isPublished",
      "showInNav",
      "order",
      "metaTitle",
      "metaDescription",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    // Validate slug if provided
    if (data.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(data.slug as string)) {
        return NextResponse.json(
          { error: "El slug solo puede contener letras minúsculas, números y guiones" },
          { status: 400 }
        );
      }
      const reserved = ["vehiculos", "contacto"];
      if (reserved.includes(data.slug as string)) {
        return NextResponse.json(
          { error: `El slug "${data.slug}" está reservado` },
          { status: 400 }
        );
      }
    }

    const page = await prisma.dealerPage.update({
      where: { id },
      data,
    });

    return NextResponse.json({ page });
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

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe una página con ese slug" },
        { status: 409 }
      );
    }

    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Error al actualizar la página" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);
    const { id } = await params;

    // Verify page belongs to this dealer
    const existing = await prisma.dealerPage.findFirst({
      where: {
        id,
        siteConfig: { dealerId: dealer.id },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    }

    await prisma.dealerPage.delete({ where: { id } });

    return NextResponse.json({ message: "Página eliminada" });
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
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Error al eliminar la página" }, { status: 500 });
  }
}
