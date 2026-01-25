"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Badge } from "@/components/ui";
import { formatPrice, formatKilometers } from "@/lib/utils";
import { FUEL_TYPES } from "@/lib/constants";
import {
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Heart,
  Loader2,
} from "lucide-react";

interface FavoriteCardProps {
  vehicle: {
    id: string;
    slug: string;
    title: string;
    price: number;
    year: number;
    mileage: number;
    fuelType: string;
    condition: string;
    featured: boolean;
    brand: { name: string; slug: string };
    model: { name: string; slug: string };
    region: { name: string; slug: string };
    images: { url: string; isPrimary: boolean }[];
  };
  onRemove: () => Promise<void> | void;
}

export function FavoriteCard({ vehicle, onRemove }: FavoriteCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];
  const fuelLabel = FUEL_TYPES[vehicle.fuelType as keyof typeof FUEL_TYPES]?.label || vehicle.fuelType;

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRemoving(true);
    await onRemove();
    setIsRemoving(false);
  };

  return (
    <Card hover padding="none" className="overflow-hidden group relative">
      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
        title="Quitar de favoritos"
      >
        {isRemoving ? (
          <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
        ) : (
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        )}
      </button>

      {/* Image */}
      <Link href={`/vehiculos/${vehicle.slug}`} className="block relative">
        <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={vehicle.title}
              fill
              className="object-cover object-[center_70%] group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Sin imagen
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
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
        <Link href={`/vehiculos/${vehicle.slug}`}>
          <h3 className="font-semibold text-neutral-900 group-hover:text-andino-600 transition-colors line-clamp-1">
            {vehicle.title}
          </h3>
        </Link>

        <div className="mt-1 text-xl font-bold text-andino-700">
          {formatPrice(vehicle.price)}
        </div>

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
            {fuelLabel}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
          <MapPin className="h-4 w-4" />
          {vehicle.region.name}
        </div>
      </div>
    </Card>
  );
}
