"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, Car, MapPin } from "lucide-react";
import { useIntersectionObserver } from "@/hooks";

interface TopDealer {
  id: string;
  slug: string;
  tradeName: string;
  logo: string | null;
  type: "AUTOMOTORA" | "RENT_A_CAR";
  region: {
    name: string;
  };
  vehicleCount: number;
}

interface AnimatedDealersGridProps {
  dealers: TopDealer[];
}

export function AnimatedDealersGrid({ dealers }: AnimatedDealersGridProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {dealers.map((dealer, index) => (
        <Link
          key={dealer.id}
          href={`/dealers/${dealer.slug}`}
          className={`group relative flex flex-col p-6 bg-white rounded-xl border border-neutral-200 hover:border-andino-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          {/* Dealer Type Badge */}
          <div className="absolute top-4 right-4">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              dealer.type === "AUTOMOTORA"
                ? "bg-andino-100 text-andino-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {dealer.type === "AUTOMOTORA" ? "Automotora" : "Rent a Car"}
            </span>
          </div>

          {/* Logo and Info */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-andino-50 transition-colors">
              {dealer.logo ? (
                <Image
                  src={dealer.logo}
                  alt={dealer.tradeName}
                  width={56}
                  height={56}
                  className="object-contain rounded-lg"
                />
              ) : (
                <Building2 className="h-8 w-8 text-neutral-400 group-hover:text-andino-500 transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 group-hover:text-andino-700 transition-colors truncate">
                {dealer.tradeName}
              </h3>
              <div className="flex items-center gap-1 text-sm text-neutral-500 mt-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{dealer.region.name}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Count */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-andino-500" />
              <span className="text-neutral-600">
                <span className="font-semibold text-neutral-900">{dealer.vehicleCount}</span>
                {" "}vehículo{dealer.vehicleCount !== 1 ? "s" : ""} disponible{dealer.vehicleCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
