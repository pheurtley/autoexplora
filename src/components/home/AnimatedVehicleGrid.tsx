"use client";

import { useIntersectionObserver } from "@/hooks";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import type { VehicleCard as VehicleCardType } from "@/types";

interface AnimatedVehicleGridProps {
  vehicles: VehicleCardType[];
}

export function AnimatedVehicleGrid({ vehicles }: AnimatedVehicleGridProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {vehicles.map((vehicle, index) => (
        <div
          key={vehicle.id}
          className={`transition-all duration-500 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <VehicleCard vehicle={vehicle} />
        </div>
      ))}
    </div>
  );
}
