import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: List comunas with optional region filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const regionId = searchParams.get("regionId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (regionId) {
      where.regionId = regionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [comunas, total] = await Promise.all([
      prisma.comuna.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          region: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { vehicles: true },
          },
        },
      }),
      prisma.comuna.count({ where }),
    ]);

    return NextResponse.json({
      comunas,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching comunas:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener comunas" },
      { status: 500 }
    );
  }
}

// POST: Create new comuna
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const body = await request.json();
    const { name, regionId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!regionId || typeof regionId !== "string") {
      return NextResponse.json(
        { error: "La región es requerida" },
        { status: 400 }
      );
    }

    // Check if region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json(
        { error: "La región no existe" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());

    // Check if comuna with same slug already exists for this region
    const existing = await prisma.comuna.findUnique({
      where: {
        regionId_slug: {
          regionId,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una comuna con este nombre para esta región" },
        { status: 400 }
      );
    }

    const comuna = await prisma.comuna.create({
      data: {
        name: name.trim(),
        slug,
        regionId,
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

    return NextResponse.json(comuna, { status: 201 });
  } catch (error) {
    console.error("Error creating comuna:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al crear la comuna" },
      { status: 500 }
    );
  }
}
