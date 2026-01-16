import Link from "next/link";
import { Container } from "@/components/layout";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Button } from "@/components/ui";
import { ArrowRight, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import type { VehicleCard as VehicleCardType } from "@/types";

async function getFeaturedVehicles(): Promise<VehicleCardType[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      featured: true,
      status: "ACTIVE",
    },
    take: 8,
    orderBy: [{ publishedAt: "desc" }],
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

  return vehicles;
}

export async function FeaturedVehicles() {
  const vehicles = await getFeaturedVehicles();

  if (vehicles.length === 0) {
    return (
      <section className="py-12">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Vehículos destacados
            </h2>
          </div>

          <div className="text-center py-12 bg-neutral-50 rounded-xl">
            <Star className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              No hay vehículos destacados
            </h3>
            <p className="text-neutral-500 mb-4">
              Explora todos los vehículos disponibles en nuestro catálogo
            </p>
            <Link href="/vehiculos">
              <Button variant="primary">
                Ver todos los vehículos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Vehículos destacados
          </h2>
          <Link href="/vehiculos?featured=true">
            <Button variant="ghost" size="sm">
              Ver todos
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
