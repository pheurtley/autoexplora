"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "lucide-react";
import { useIntersectionObserver } from "@/hooks";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  vehicleCount: number;
}

interface AnimatedBrandsGridProps {
  brands: Brand[];
}

export function AnimatedBrandsGrid({ brands }: AnimatedBrandsGridProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
    >
      {brands.map((brand, index) => (
        <Link
          key={brand.id}
          href={`/vehiculos?marca=${brand.slug}`}
          className={`group flex flex-col items-center p-4 bg-white rounded-xl border border-neutral-200 hover:border-andino-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
            isVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <div className="w-16 h-16 mb-3 flex items-center justify-center bg-neutral-50 rounded-lg group-hover:bg-andino-50 transition-colors">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={48}
                height={48}
                className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <Car className="h-8 w-8 text-neutral-400 group-hover:text-andino-500 transition-colors" />
            )}
          </div>
          <span className="text-sm font-medium text-neutral-800 group-hover:text-andino-700 transition-colors text-center">
            {brand.name}
          </span>
          <span className="text-xs text-neutral-500 mt-1">
            {brand.vehicleCount} vehículo{brand.vehicleCount !== 1 ? "s" : ""}
          </span>
        </Link>
      ))}
    </div>
  );
}
