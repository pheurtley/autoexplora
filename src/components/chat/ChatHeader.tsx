"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { User as UserType, Vehicle, VehicleImage, Brand, Model } from "@prisma/client";

interface ChatHeaderProps {
  otherUser: Pick<UserType, "id" | "name" | "image">;
  vehicle: Pick<Vehicle, "id" | "slug" | "title" | "price"> & {
    images: Pick<VehicleImage, "url" | "isPrimary">[];
    brand: Pick<Brand, "name">;
    model: Pick<Model, "name">;
  };
  basePath?: string;
}

export function ChatHeader({ otherUser, vehicle, basePath = "/cuenta/mensajes" }: ChatHeaderProps) {
  const vehicleImage = vehicle.images[0]?.url;

  return (
    <div className="flex items-center gap-3 p-4 border-b border-neutral-200 bg-white">
      <Link
        href={basePath}
        className="p-2 -ml-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-100 rounded-lg transition-colors md:hidden"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center overflow-hidden shrink-0">
          {otherUser.image ? (
            <Image
              src={otherUser.image}
              alt={otherUser.name || "Usuario"}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-andino-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 truncate">
            {otherUser.name || "Usuario"}
          </p>
          <p className="text-sm text-neutral-500 truncate">
            {vehicle.brand.name} {vehicle.model.name}
          </p>
        </div>
      </div>

      {/* Vehicle preview */}
      <Link
        href={`/vehiculos/${vehicle.slug}`}
        className="flex items-center gap-3 p-2 -mr-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-neutral-900 text-right">
            {formatPrice(vehicle.price)}
          </p>
          <p className="text-xs text-neutral-500 text-right truncate max-w-[150px]">
            {vehicle.title}
          </p>
        </div>
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
          {vehicleImage ? (
            <Image
              src={vehicleImage}
              alt={vehicle.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-neutral-400" />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
