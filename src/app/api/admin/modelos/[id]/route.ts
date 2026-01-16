import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get single model
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Modelo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error("Error fetching model:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener el modelo" },
      { status: 500 }
    );
  }
}

// PATCH: Update model
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    // Check if model exists
    const existingModel = await prisma.model.findUnique({
      where: { id },
    });

    if (!existingModel) {
      return NextResponse.json(
        { error: "Modelo no encontrado" },
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

      // Check if another model has this slug for the same brand
      const duplicate = await prisma.model.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { brandId: existingModel.brandId },
            { slug: newSlug },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe otro modelo con este nombre para esta marca" },
          { status: 400 }
        );
      }

      const model = await prisma.model.update({
        where: { id },
        data: {
          name: name.trim(),
          slug: newSlug,
        },
        include: {
          brand: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { vehicles: true },
          },
        },
      });

      return NextResponse.json(model);
    }

    return NextResponse.json(existingModel);
  } catch (error) {
    console.error("Error updating model:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar el modelo" },
      { status: 500 }
    );
  }
}

// DELETE: Delete model (only if no vehicles)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    // Check if model exists and has vehicles
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Modelo no encontrado" },
        { status: 404 }
      );
    }

    if (model._count.vehicles > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar el modelo porque tiene ${model._count.vehicles} vehículo(s) asociado(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.model.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting model:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar el modelo" },
      { status: 500 }
    );
  }
}
