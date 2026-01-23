import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";

interface RouteParams {
  params: Promise<{ id: string; pageId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId, pageId } = await params;

    const existing = await prisma.dealerPage.findFirst({
      where: {
        id: pageId,
        siteConfig: { dealerId },
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
      where: { id: pageId },
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId, pageId } = await params;

    const existing = await prisma.dealerPage.findFirst({
      where: {
        id: pageId,
        siteConfig: { dealerId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 });
    }

    await prisma.dealerPage.delete({ where: { id: pageId } });

    return NextResponse.json({ message: "Página eliminada" });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Error al eliminar la página" }, { status: 500 });
  }
}
