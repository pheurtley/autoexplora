import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: List models with optional brand filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const brandId = searchParams.get("brandId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (brandId) {
      where.brandId = brandId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          brand: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { vehicles: true },
          },
        },
      }),
      prisma.model.count({ where }),
    ]);

    return NextResponse.json({
      models,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener modelos" },
      { status: 500 }
    );
  }
}

// POST: Create new model
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const body = await request.json();
    const { name, brandId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!brandId || typeof brandId !== "string") {
      return NextResponse.json(
        { error: "La marca es requerida" },
        { status: 400 }
      );
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "La marca no existe" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());

    // Check if model with same slug already exists for this brand
    const existing = await prisma.model.findUnique({
      where: {
        brandId_slug: {
          brandId,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un modelo con este nombre para esta marca" },
        { status: 400 }
      );
    }

    const model = await prisma.model.create({
      data: {
        name: name.trim(),
        slug,
        brandId,
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

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error("Error creating model:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al crear el modelo" },
      { status: 500 }
    );
  }
}
