import Link from "next/link";
import Image from "next/image";
import { Card, Badge } from "@/components/ui";
import { formatPrice, formatKilometers, getWhatsAppLink } from "@/lib/utils";
import { FUEL_TYPES } from "@/lib/constants";
import {
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  MessageCircle,
  Star,
  Building2,
} from "lucide-react";
import type { VehicleCard as VehicleCardType } from "@/types";

interface VehicleCardProps {
  vehicle: VehicleCardType;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];
  const whatsappMessage = `Hola, me interesa el ${vehicle.title} publicado en AutoExplora.cl`;

  return (
    <Card hover padding="none" className="overflow-hidden group">
      {/* Image */}
      <Link href={`/vehiculos/${vehicle.slug}`} className="block relative">
        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={vehicle.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <Settings2 className="h-12 w-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {vehicle.dealer && (
              <Badge variant="primary" size="sm" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {vehicle.dealer.type === "AUTOMOTORA"
                  ? "Automotora"
                  : "Rent a Car"}
              </Badge>
            )}
            {vehicle.featured && (
              <Badge variant="warning" size="sm" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Destacado
              </Badge>
            )}
            {vehicle.condition === "NUEVO" && (
              <Badge variant="success" size="sm">
                Nuevo
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/vehiculos/${vehicle.slug}`}>
          <h3 className="font-semibold text-neutral-900 group-hover:text-andino-600 transition-colors line-clamp-1">
            {vehicle.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-1 text-xl font-bold text-andino-700 group-hover:text-andino-600 transition-colors">
          {formatPrice(vehicle.price)}
        </div>

        {/* Specs */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {vehicle.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            {formatKilometers(vehicle.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            {FUEL_TYPES[vehicle.fuelType]?.label}
          </span>
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
          <MapPin className="h-4 w-4" />
          {vehicle.region.name}
        </div>

        {/* Dealer Link */}
        {vehicle.dealer && (
          <Link
            href={`/automotora/${vehicle.dealer.slug}`}
            className="mt-2 flex items-center gap-2 text-sm text-andino-600 hover:text-andino-700"
            onClick={(e) => e.stopPropagation()}
          >
            {vehicle.dealer.logo ? (
              <img
                src={vehicle.dealer.logo}
                alt={vehicle.dealer.tradeName}
                className="w-5 h-5 rounded object-contain"
              />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <span className="truncate">{vehicle.dealer.tradeName}</span>
          </Link>
        )}

        {/* WhatsApp Button */}
        {vehicle.contactWhatsApp && (
          <a
            href={getWhatsAppLink(vehicle.contactWhatsApp, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/whatsapp mt-3 flex items-center justify-center gap-2 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4 transition-transform group-hover/whatsapp:scale-110" />
            WhatsApp
          </a>
        )}
      </div>
    </Card>
  );
}
