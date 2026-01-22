import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: List versions with optional model filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const modelId = searchParams.get("modelId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (modelId) {
      where.modelId = modelId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [versions, total] = await Promise.all([
      prisma.version.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
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
      }),
      prisma.version.count({ where }),
    ]);

    return NextResponse.json({
      versions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching versions:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener versiones" },
      { status: 500 }
    );
  }
}

// POST: Create new version
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const body = await request.json();
    const { name, modelId, engineSize, horsePower, transmission, drivetrain, trimLevel } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!modelId || typeof modelId !== "string") {
      return NextResponse.json(
        { error: "El modelo es requerido" },
        { status: 400 }
      );
    }

    // Check if model exists
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: { brand: { select: { id: true, name: true } } },
    });

    if (!model) {
      return NextResponse.json(
        { error: "El modelo no existe" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());

    // Check if version with same slug already exists for this model
    const existing = await prisma.version.findUnique({
      where: {
        modelId_slug: {
          modelId,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una versión con este nombre para este modelo" },
        { status: 400 }
      );
    }

    const version = await prisma.version.create({
      data: {
        name: name.trim(),
        slug,
        modelId,
        engineSize: engineSize?.trim() || null,
        horsePower: horsePower ? parseInt(horsePower) : null,
        transmission: transmission?.trim() || null,
        drivetrain: drivetrain?.trim() || null,
        trimLevel: trimLevel?.trim() || null,
      },
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

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("Error creating version:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al crear la versión" },
      { status: 500 }
    );
  }
}
