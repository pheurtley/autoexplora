import Link from "next/link";
import { VehicleCard } from "./VehicleCard";
import { Button } from "@/components/ui";
import { Car, Plus } from "lucide-react";
import type { VehicleCard as VehicleCardType } from "@/types";

interface VehicleGridProps {
  vehicles: VehicleCardType[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          No se encontraron vehículos
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          Intenta ajustar los filtros de búsqueda o explora todas las opciones
          disponibles.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/vehiculos">
            <Button variant="outline">Ver todos los vehículos</Button>
          </Link>
          <Link href="/publicar">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar vehículo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
