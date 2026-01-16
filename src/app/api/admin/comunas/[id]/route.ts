import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get single comuna
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const comuna = await prisma.comuna.findUnique({
      where: { id },
      include: {
        region: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!comuna) {
      return NextResponse.json(
        { error: "Comuna no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(comuna);
  } catch (error) {
    console.error("Error fetching comuna:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener la comuna" },
      { status: 500 }
    );
  }
}

// PATCH: Update comuna
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    // Check if comuna exists
    const existingComuna = await prisma.comuna.findUnique({
      where: { id },
    });

    if (!existingComuna) {
      return NextResponse.json(
        { error: "Comuna no encontrada" },
        { status: 404 }
      );
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }

      const newSlug = slugify(name.trim());

      // Check if another comuna has this slug for the same region
      const duplicate = await prisma.comuna.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { regionId: existingComuna.regionId },
            { slug: newSlug },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe otra comuna con este nombre para esta región" },
          { status: 400 }
        );
      }

      const comuna = await prisma.comuna.update({
        where: { id },
        data: {
          name: name.trim(),
          slug: newSlug,
        },
        include: {
          region: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { vehicles: true },
          },
        },
      });

      return NextResponse.json(comuna);
    }

    return NextResponse.json(existingComuna);
  } catch (error) {
    console.error("Error updating comuna:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar la comuna" },
      { status: 500 }
    );
  }
}

// DELETE: Delete comuna (only if no vehicles)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    // Check if comuna exists and has vehicles
    const comuna = await prisma.comuna.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!comuna) {
      return NextResponse.json(
        { error: "Comuna no encontrada" },
        { status: 404 }
      );
    }

    if (comuna._count.vehicles > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la comuna porque tiene ${comuna._count.vehicles} vehículo(s) asociado(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.comuna.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comuna:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar la comuna" },
      { status: 500 }
    );
  }
}
