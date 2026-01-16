import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get single brand with models
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        models: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
        _count: {
          select: {
            models: true,
            vehicles: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marca no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener la marca" },
      { status: 500 }
    );
  }
}

// PATCH: Update brand
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { name, logo } = body;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Marca no encontrada" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }

      const newSlug = slugify(name.trim());

      // Check if another brand has this name or slug
      const duplicate = await prisma.brand.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { name: { equals: name.trim(), mode: "insensitive" } },
                { slug: newSlug },
              ],
            },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe otra marca con este nombre" },
          { status: 400 }
        );
      }

      updateData.name = name.trim();
      updateData.slug = newSlug;
    }

    if (logo !== undefined) {
      updateData.logo = logo || null;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            models: true,
            vehicles: true,
          },
        },
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error updating brand:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar la marca" },
      { status: 500 }
    );
  }
}

// DELETE: Delete brand (only if no vehicles)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    // Check if brand exists and has vehicles
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marca no encontrada" },
        { status: 404 }
      );
    }

    if (brand._count.vehicles > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la marca porque tiene ${brand._count.vehicles} vehículo(s) asociado(s)`,
        },
        { status: 400 }
      );
    }

    // Delete the brand (models will be cascade deleted)
    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar la marca" },
      { status: 500 }
    );
  }
}
