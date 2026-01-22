import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    await requireAdmin(session);

    const [
      totalBrands,
      totalModels,
      totalVersions,
      totalVehicles,
      brandsWithoutModels,
      modelsWithoutVersions,
      versionsWithoutVehicles,
      topBrandsByVehicles,
      topModelsByVehicles,
      brandsWithLogos,
      versionsWithMetadata,
    ] = await Promise.all([
      // Totals
      prisma.brand.count(),
      prisma.model.count(),
      prisma.version.count(),
      prisma.vehicle.count(),

      // Data quality issues
      prisma.brand.count({
        where: { models: { none: {} } },
      }),
      prisma.model.count({
        where: { versions: { none: {} } },
      }),
      prisma.version.count({
        where: { vehicles: { none: {} } },
      }),

      // Top brands by vehicle count
      prisma.brand.findMany({
        take: 10,
        orderBy: { vehicles: { _count: "desc" } },
        select: {
          id: true,
          name: true,
          logo: true,
          _count: { select: { vehicles: true, models: true } },
        },
      }),

      // Top models by vehicle count
      prisma.model.findMany({
        take: 10,
        orderBy: { vehicles: { _count: "desc" } },
        select: {
          id: true,
          name: true,
          brand: { select: { id: true, name: true } },
          _count: { select: { vehicles: true, versions: true } },
        },
      }),

      // Brands with logos
      prisma.brand.count({
        where: { logo: { not: null } },
      }),

      // Versions with metadata
      prisma.version.count({
        where: {
          OR: [
            { engineSize: { not: null } },
            { horsePower: { not: null } },
            { transmission: { not: null } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      totals: {
        brands: totalBrands,
        models: totalModels,
        versions: totalVersions,
        vehicles: totalVehicles,
      },
      dataQuality: {
        brandsWithoutModels,
        modelsWithoutVersions,
        versionsWithoutVehicles,
        brandsWithLogos,
        brandsWithoutLogos: totalBrands - brandsWithLogos,
        versionsWithMetadata,
        versionsWithoutMetadata: totalVersions - versionsWithMetadata,
      },
      topBrands: topBrandsByVehicles,
      topModels: topModelsByVehicles,
    });
  } catch (error) {
    console.error("Error fetching catalog stats:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener estadísticas del catálogo" },
      { status: 500 }
    );
  }
}
