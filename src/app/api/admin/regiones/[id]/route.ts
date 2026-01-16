import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get single region with comunas
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const region = await prisma.region.findUnique({
      where: { id },
      include: {
        comunas: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
        _count: {
          select: {
            comunas: true,
            vehicles: true,
          },
        },
      },
    });

    if (!region) {
      return NextResponse.json(
        { error: "Región no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(region);
  } catch (error) {
    console.error("Error fetching region:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener la región" },
      { status: 500 }
    );
  }
}

// PATCH: Update region
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { name, order } = body;

    // Check if region exists
    const existingRegion = await prisma.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      return NextResponse.json(
        { error: "Región no encontrada" },
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

      // Check if another region has this name or slug
      const duplicate = await prisma.region.findFirst({
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
          { error: "Ya existe otra región con este nombre" },
          { status: 400 }
        );
      }

      updateData.name = name.trim();
      updateData.slug = newSlug;
    }

    if (order !== undefined) {
      if (typeof order !== "number") {
        return NextResponse.json(
          { error: "El orden debe ser un número" },
          { status: 400 }
        );
      }
      updateData.order = order;
    }

    const region = await prisma.region.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            comunas: true,
            vehicles: true,
          },
        },
      },
    });

    return NextResponse.json(region);
  } catch (error) {
    console.error("Error updating region:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar la región" },
      { status: 500 }
    );
  }
}

// DELETE: Delete region (only if no vehicles)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    // Check if region exists and has vehicles
    const region = await prisma.region.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!region) {
      return NextResponse.json(
        { error: "Región no encontrada" },
        { status: 404 }
      );
    }

    if (region._count.vehicles > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la región porque tiene ${region._count.vehicles} vehículo(s) asociado(s)`,
        },
        { status: 400 }
      );
    }

    // Delete the region (comunas will be cascade deleted)
    await prisma.region.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting region:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar la región" },
      { status: 500 }
    );
  }
}
