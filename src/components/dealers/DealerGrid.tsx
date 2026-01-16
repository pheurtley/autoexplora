import Link from "next/link";
import { DealerCard } from "./DealerCard";
import { Button } from "@/components/ui";
import { Building2 } from "lucide-react";
import type { DealerType, Region } from "@prisma/client";

interface DealerGridProps {
  dealers: Array<{
    id: string;
    slug: string;
    tradeName: string;
    type: DealerType;
    logo: string | null;
    verifiedAt: Date | null;
    region: Pick<Region, "id" | "name">;
    _count: {
      vehicles: number;
    };
  }>;
}

export function DealerGrid({ dealers }: DealerGridProps) {
  if (dealers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          No se encontraron concesionarios
        </h3>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          Intenta ajustar los filtros de búsqueda o explora todas las opciones
          disponibles.
        </p>
        <Link href="/concesionarios">
          <Button variant="outline">Ver todos los concesionarios</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {dealers.map((dealer) => (
        <DealerCard key={dealer.id} dealer={dealer} />
      ))}
    </div>
  );
}
