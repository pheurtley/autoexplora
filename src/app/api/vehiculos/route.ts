import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { publishVehicleSchema } from "@/lib/validations";
import { generateVehicleSlug } from "@/lib/utils";
import { VehicleType, VehicleCategory, VehicleCondition, FuelType, Transmission } from "@prisma/client";

// GET /api/vehiculos - Listar vehículos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Parámetros de filtro
    const vehicleType = searchParams.get("vehicleType") as VehicleType | null;
    const category = searchParams.get("category") as VehicleCategory | null;
    const brandId = searchParams.get("brandId");
    const modelId = searchParams.get("modelId");
    const regionId = searchParams.get("regionId");
    const condition = searchParams.get("condition") as VehicleCondition | null;
    const fuelType = searchParams.get("fuelType") as FuelType | null;
    const transmission = searchParams.get("transmission") as Transmission | null;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const search = searchParams.get("search");

    // Construir where clause
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (vehicleType) where.vehicleType = vehicleType;
    if (category) where.category = category;
    if (brandId) where.brandId = brandId;
    if (modelId) where.modelId = modelId;
    if (regionId) where.regionId = regionId;
    if (condition) where.condition = condition;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) (where.year as Record<string, number>).gte = parseInt(minYear);
      if (maxYear) (where.year as Record<string, number>).lte = parseInt(maxYear);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Ejecutar consultas en paralelo
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: "desc" },
          { publishedAt: "desc" },
        ],
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          model: { select: { id: true, name: true, slug: true } },
          region: { select: { id: true, name: true, slug: true } },
          images: {
            select: { id: true, url: true, isPrimary: true },
            orderBy: { order: "asc" },
            take: 5,
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos" },
      { status: 500 }
    );
  }
}

// POST /api/vehiculos - Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para publicar" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar datos con Zod
    const validation = publishVehicleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar que la marca existe
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marca no válida" },
        { status: 400 }
      );
    }

    // Verificar que el modelo pertenece a la marca
    const model = await prisma.model.findFirst({
      where: {
        id: data.modelId,
        brandId: data.brandId,
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Modelo no válido para esta marca" },
        { status: 400 }
      );
    }

    // Verificar versión si se proporciona
    if (data.versionId) {
      const version = await prisma.version.findFirst({
        where: {
          id: data.versionId,
          modelId: data.modelId,
        },
      });

      if (!version) {
        return NextResponse.json(
          { error: "Versión no válida para este modelo" },
          { status: 400 }
        );
      }
    }

    // Verificar que la región existe
    const region = await prisma.region.findUnique({
      where: { id: data.regionId },
    });

    if (!region) {
      return NextResponse.json(
        { error: "Región no válida" },
        { status: 400 }
      );
    }

    // Verificar comuna si se proporciona
    if (data.comunaId) {
      const comuna = await prisma.comuna.findFirst({
        where: {
          id: data.comunaId,
          regionId: data.regionId,
        },
      });

      if (!comuna) {
        return NextResponse.json(
          { error: "Comuna no válida para esta región" },
          { status: 400 }
        );
      }
    }

    // Check if user belongs to a dealer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dealerId: true },
    });

    // Crear el vehículo con slug temporal, luego actualizar con slug final
    const vehicle = await prisma.$transaction(async (tx) => {
      // Crear con slug temporal
      const created = await tx.vehicle.create({
        data: {
          title: data.title,
          slug: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          description: data.description,
          price: data.price,
          negotiable: data.negotiable,
          vehicleType: data.vehicleType as VehicleType,
          category: data.category as VehicleCategory,
          condition: data.condition as VehicleCondition,
          brandId: data.brandId,
          modelId: data.modelId,
          versionId: data.versionId || null,
          year: data.year,
          mileage: data.mileage,
          fuelType: data.fuelType as FuelType,
          transmission: data.transmission as Transmission,
          engineSize: data.engineSize,
          color: data.color,
          doors: data.doors,
          regionId: data.regionId,
          comunaId: data.comunaId,
          contactPhone: data.contactPhone,
          contactWhatsApp: data.contactWhatsApp,
          showPhone: data.showPhone,
          userId: session.user!.id!,
          dealerId: user?.dealerId || null,
          status: "ACTIVE",
          publishedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        },
      });

      // Crear imágenes del vehículo
      if (data.images && data.images.length > 0) {
        await tx.vehicleImage.createMany({
          data: data.images.map((img, index) => ({
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary || index === 0,
            order: img.order ?? index,
            vehicleId: created.id,
          })),
        });
      }

      // Generar slug con el ID real
      const slug = generateVehicleSlug(
        data.year,
        brand.slug,
        model.slug,
        data.title,
        created.id
      );

      // Actualizar con slug final
      return tx.vehicle.update({
        where: { id: created.id },
        data: { slug },
        include: {
          brand: { select: { name: true, slug: true } },
          model: { select: { name: true, slug: true } },
          version: { select: { name: true, slug: true } },
          region: { select: { name: true } },
          images: {
            select: { id: true, url: true, isPrimary: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return NextResponse.json(
      { vehicle, message: "Vehículo publicado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Error al crear el vehículo" },
      { status: 500 }
    );
  }
}
