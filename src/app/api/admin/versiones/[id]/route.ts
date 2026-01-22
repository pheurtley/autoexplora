import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Fetch single version
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const version = await prisma.version.findUnique({
      where: { id },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            brand: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Versión no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error("Error fetching version:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener la versión" },
      { status: 500 }
    );
  }
}

// PATCH: Update version
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { name, engineSize, horsePower, transmission, drivetrain, trimLevel } = body;

    // Check if version exists
    const existing = await prisma.version.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Versión no encontrada" },
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

      // Check if another version with same slug exists for this model
      const duplicate = await prisma.version.findFirst({
        where: {
          modelId: existing.modelId,
          slug: newSlug,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe otra versión con este nombre para este modelo" },
          { status: 400 }
        );
      }

      updateData.name = name.trim();
      updateData.slug = newSlug;
    }

    if (engineSize !== undefined) {
      updateData.engineSize = engineSize?.trim() || null;
    }

    if (horsePower !== undefined) {
      updateData.horsePower = horsePower ? parseInt(horsePower) : null;
    }

    if (transmission !== undefined) {
      updateData.transmission = transmission?.trim() || null;
    }

    if (drivetrain !== undefined) {
      updateData.drivetrain = drivetrain?.trim() || null;
    }

    if (trimLevel !== undefined) {
      updateData.trimLevel = trimLevel?.trim() || null;
    }

    const version = await prisma.version.update({
      where: { id },
      data: updateData,
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            brand: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: { vehicles: true },
        },
      },
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error("Error updating version:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar la versión" },
      { status: 500 }
    );
  }
}

// DELETE: Delete version
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    // Check if version exists and has vehicles
    const version = await prisma.version.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Versión no encontrada" },
        { status: 404 }
      );
    }

    if (version._count.vehicles > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la versión porque tiene ${version._count.vehicles} vehículo(s) asociado(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.version.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting version:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar la versión" },
      { status: 500 }
    );
  }
}
