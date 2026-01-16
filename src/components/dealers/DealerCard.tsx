import Link from "next/link";
import Image from "next/image";
import { Card, Badge } from "@/components/ui";
import { DEALER_TYPES } from "@/lib/constants";
import { Building2, MapPin, Car, BadgeCheck } from "lucide-react";
import type { DealerType, Region } from "@prisma/client";

interface DealerCardProps {
  dealer: {
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
  };
}

export function DealerCard({ dealer }: DealerCardProps) {
  const typeConfig = DEALER_TYPES[dealer.type];
  const isVerified = dealer.verifiedAt !== null;

  return (
    <Card hover padding="none" className="overflow-hidden group">
      <Link href={`/concesionario/${dealer.slug}`} className="block">
        {/* Logo Section */}
        <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden flex items-center justify-center">
          {dealer.logo ? (
            <Image
              src={dealer.logo}
              alt={dealer.tradeName}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <Building2 className="h-16 w-16 text-neutral-300" />
          )}

          {/* Verified Badge */}
          {isVerified && (
            <div className="absolute top-3 right-3">
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                Verificado
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name and Type */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-neutral-900 group-hover:text-andino-600 transition-colors line-clamp-1">
              {dealer.tradeName}
            </h3>
            <Badge variant="default" size="sm" className="shrink-0">
              {typeConfig.label}
            </Badge>
          </div>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{dealer.region.name}</span>
          </div>

          {/* Vehicle Count */}
          <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
            <Car className="h-4 w-4 shrink-0" />
            <span>
              {dealer._count.vehicles}{" "}
              {dealer._count.vehicles === 1 ? "vehículo" : "vehículos"} en venta
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
