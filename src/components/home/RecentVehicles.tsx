import Link from "next/link";
import { Container } from "@/components/layout";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Button } from "@/components/ui";
import { ArrowRight, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import type { VehicleCard as VehicleCardType } from "@/types";

async function getRecentVehicles(): Promise<VehicleCardType[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "ACTIVE",
    },
    take: 8,
    orderBy: {
      publishedAt: "desc",
    },
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

export async function RecentVehicles() {
  const vehicles = await getRecentVehicles();

  if (vehicles.length === 0) {
    return (
      <section className="py-12 bg-neutral-50">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Publicados recientemente
            </h2>
          </div>

          <div className="text-center py-12 bg-white rounded-xl">
            <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              No hay vehículos recientes
            </h3>
            <p className="text-neutral-500 mb-4">
              Sé el primero en publicar un vehículo en nuestro marketplace
            </p>
            <Link href="/publicar">
              <Button variant="primary">
                Publicar vehículo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 bg-neutral-50">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Publicados recientemente
          </h2>
          <Link href="/vehiculos?sort=date">
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
