import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { VehicleList } from "./VehicleList";
import { Car, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Publicaciones | AutoExplora.cl",
};

export default async function MisPublicacionesPage() {
  const session = await auth();

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session!.user!.id },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      year: true,
      status: true,
      views: true,
      publishedAt: true,
      brand: { select: { name: true } },
      model: { select: { name: true } },
      region: { select: { name: true } },
      images: {
        select: { url: true },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mis Publicaciones</h1>
        <Link href="/publicar">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva publicación
          </Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Car className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            No tienes publicaciones
          </h2>
          <p className="text-neutral-500 mb-6">
            Publica tu primer vehículo y llega a miles de compradores
          </p>
          <Link href="/publicar">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Publicar vehículo
            </Button>
          </Link>
        </div>
      ) : (
        <VehicleList initialVehicles={vehicles} />
      )}
    </div>
  );
}
