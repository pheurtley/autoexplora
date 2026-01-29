import prisma from "@/lib/prisma";
import { ListingStatus, VehicleType, VehicleCondition, Prisma } from "@prisma/client";

interface LeadPreference {
  brandIds: string[];
  modelIds: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
  vehicleType: string | null;
  condition: string | null;
}

interface MatchedVehicle {
  id: string;
  title: string;
  slug: string;
  price: number;
  year: number;
  mileage: number;
  brand: { name: string };
  model: { name: string };
  images: { url: string; isPrimary: boolean }[];
  matchScore: number;
  matchReasons: string[];
}

/**
 * Find vehicles that match a lead's preferences
 */
export async function matchVehiclesForLead(
  dealerId: string,
  preferences: LeadPreference,
  limit: number = 5
): Promise<MatchedVehicle[]> {
  // Build base query
  const where: Prisma.VehicleWhereInput = {
    dealerId,
    status: ListingStatus.ACTIVE,
  };

  // Apply filters from preferences
  if (preferences.brandIds.length > 0) {
    where.brandId = { in: preferences.brandIds };
  }

  if (preferences.modelIds.length > 0) {
    where.modelId = { in: preferences.modelIds };
  }

  if (preferences.minPrice || preferences.maxPrice) {
    where.price = {};
    if (preferences.minPrice) where.price.gte = preferences.minPrice;
    if (preferences.maxPrice) where.price.lte = preferences.maxPrice;
  }

  if (preferences.minYear || preferences.maxYear) {
    where.year = {};
    if (preferences.minYear) where.year.gte = preferences.minYear;
    if (preferences.maxYear) where.year.lte = preferences.maxYear;
  }

  if (preferences.vehicleType && Object.values(VehicleType).includes(preferences.vehicleType as VehicleType)) {
    where.vehicleType = preferences.vehicleType as VehicleType;
  }

  if (preferences.condition && Object.values(VehicleCondition).includes(preferences.condition as VehicleCondition)) {
    where.condition = preferences.condition as VehicleCondition;
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      brand: { select: { name: true } },
      model: { select: { name: true } },
      images: {
        select: { url: true, isPrimary: true },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit * 2, // Get more than needed for scoring
  });

  // Calculate match scores
  const scoredVehicles = vehicles.map((vehicle) => {
    let score = 0;
    const reasons: string[] = [];

    // Brand match
    if (preferences.brandIds.length > 0 && preferences.brandIds.includes(vehicle.brandId)) {
      score += 30;
      reasons.push(`Marca: ${vehicle.brand.name}`);
    }

    // Model match
    if (preferences.modelIds.length > 0 && preferences.modelIds.includes(vehicle.modelId)) {
      score += 40;
      reasons.push(`Modelo: ${vehicle.model.name}`);
    }

    // Price range match
    if (preferences.minPrice || preferences.maxPrice) {
      const inPriceRange =
        (!preferences.minPrice || vehicle.price >= preferences.minPrice) &&
        (!preferences.maxPrice || vehicle.price <= preferences.maxPrice);

      if (inPriceRange) {
        score += 20;
        reasons.push("Dentro del presupuesto");
      }
    }

    // Year range match
    if (preferences.minYear || preferences.maxYear) {
      const inYearRange =
        (!preferences.minYear || vehicle.year >= preferences.minYear) &&
        (!preferences.maxYear || vehicle.year <= preferences.maxYear);

      if (inYearRange) {
        score += 10;
        reasons.push(`Año ${vehicle.year}`);
      }
    }

    return {
      id: vehicle.id,
      title: vehicle.title,
      slug: vehicle.slug,
      price: vehicle.price,
      year: vehicle.year,
      mileage: vehicle.mileage,
      brand: vehicle.brand,
      model: vehicle.model,
      images: vehicle.images,
      matchScore: score,
      matchReasons: reasons,
    };
  });

  // Sort by score and return top matches
  return scoredVehicles
    .filter((v) => v.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Find leads that match a newly published vehicle
 */
export async function findMatchingLeadsForVehicle(
  dealerId: string,
  vehicle: {
    brandId: string;
    modelId: string;
    price: number;
    year: number;
    vehicleType: string;
    condition: string;
  }
): Promise<string[]> {
  // Find leads with preferences that match this vehicle
  const matchingPreferences = await prisma.leadPreferences.findMany({
    where: {
      lead: {
        dealerId,
        status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
      },
      OR: [
        { brandIds: { has: vehicle.brandId } },
        { modelIds: { has: vehicle.modelId } },
        {
          AND: [
            { minPrice: { lte: vehicle.price } },
            { maxPrice: { gte: vehicle.price } },
          ],
        },
      ],
    },
    select: {
      leadId: true,
    },
  });

  return matchingPreferences.map((p) => p.leadId);
}
