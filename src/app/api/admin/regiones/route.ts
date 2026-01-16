import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: List regions ordered by order field
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [regions, total] = await Promise.all([
      prisma.region.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: {
              comunas: true,
              vehicles: true,
            },
          },
        },
      }),
      prisma.region.count({ where }),
    ]);

    return NextResponse.json({
      regions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener regiones" },
      { status: 500 }
    );
  }
}

// POST: Create new region
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const body = await request.json();
    const { name, order } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (order === undefined || typeof order !== "number") {
      return NextResponse.json(
        { error: "El orden es requerido" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());

    // Check if name or slug already exists
    const existing = await prisma.region.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: "insensitive" } },
          { slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una región con este nombre" },
        { status: 400 }
      );
    }

    const region = await prisma.region.create({
      data: {
        name: name.trim(),
        slug,
        order,
      },
      include: {
        _count: {
          select: {
            comunas: true,
            vehicles: true,
          },
        },
      },
    });

    return NextResponse.json(region, { status: 201 });
  } catch (error) {
    console.error("Error creating region:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al crear la región" },
      { status: 500 }
    );
  }
}
