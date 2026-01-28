import Link from "next/link";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { VehicleCard } from "./VehicleCard";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import type { VehicleCard as VehicleCardType } from "@/types";

interface RelatedVehiclesProps {
  currentVehicleId: string;
  brandId: string;
  brandSlug: string;
  price: number;
  vehicleType: string;
  limit?: number;
}

async function getRelatedVehicles(
  currentVehicleId: string,
  brandId: string,
  price: number,
  vehicleType: string,
  limit: number = 4
): Promise<VehicleCardType[]> {
  // Price range: 20% above and below
  const minPrice = Math.floor(price * 0.8);
  const maxPrice = Math.ceil(price * 1.2);

  try {
    // First, try to find vehicles of the same brand
    let vehicles = await prisma.vehicle.findMany({
      where: {
        id: { not: currentVehicleId },
        status: "ACTIVE",
        brandId: brandId,
      },
      take: limit,
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        year: true,
        mileage: true,
        fuelType: true,
        transmission: true,
        condition: true,
        featured: true,
        contactWhatsApp: true,
        publishedAt: true,
        dealerId: true,
        brand: {
          select: {
            name: true,
            slug: true,
          },
        },
        model: {
          select: {
            name: true,
            slug: true,
          },
        },
        region: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            url: true,
            isPrimary: true,
          },
          orderBy: {
            order: "asc",
          },
          take: 3,
        },
      },
    });

    // If we don't have enough, fill with similar price/type vehicles
    if (vehicles.length < limit) {
      const remainingLimit = limit - vehicles.length;
      const existingIds = [currentVehicleId, ...vehicles.map((v) => v.id)];

      const similarVehicles = await prisma.vehicle.findMany({
        where: {
          id: { notIn: existingIds },
          status: "ACTIVE",
          vehicleType: vehicleType as "AUTO" | "MOTO" | "COMERCIAL",
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
        take: remainingLimit,
        orderBy: [
          { featured: "desc" },
          { publishedAt: "desc" },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          year: true,
          mileage: true,
          fuelType: true,
          transmission: true,
          condition: true,
          featured: true,
          contactWhatsApp: true,
          publishedAt: true,
          dealerId: true,
          brand: {
            select: {
              name: true,
              slug: true,
            },
          },
          model: {
            select: {
              name: true,
              slug: true,
            },
          },
          region: {
            select: {
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              url: true,
              isPrimary: true,
            },
            orderBy: {
              order: "asc",
            },
            take: 3,
          },
        },
      });

      vehicles = [...vehicles, ...similarVehicles];
    }

    return vehicles;
  } catch (error) {
    console.error("Error fetching related vehicles:", error);
    return [];
  }
}

export async function RelatedVehicles({
  currentVehicleId,
  brandId,
  brandSlug,
  price,
  vehicleType,
  limit = 4,
}: RelatedVehiclesProps) {
  const vehicles = await getRelatedVehicles(
    currentVehicleId,
    brandId,
    price,
    vehicleType,
    limit
  );

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-neutral-200">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Vehículos similares
          </h2>
          <Link href={`/vehiculos/marca/${brandSlug}`}>
            <Button variant="ghost" size="sm">
              Ver más de esta marca
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </Container>
    </section>
  );
}
