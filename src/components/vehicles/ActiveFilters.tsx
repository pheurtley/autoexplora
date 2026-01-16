"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  VEHICLE_TYPES,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CONDITIONS,
  COLORS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

interface ActiveFiltersProps {
  filters: Record<string, string | undefined>;
  brandName?: string;
  modelName?: string;
  regionName?: string;
}

interface FilterPill {
  key: string;
  label: string;
  value: string;
}

export function ActiveFilters({
  filters,
  brandName,
  modelName,
  regionName,
}: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    // If removing brand, also remove model
    if (key === "brandId") {
      params.delete("modelId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Build list of active filter pills
  const pills: FilterPill[] = [];

  if (filters.search) {
    pills.push({
      key: "search",
      label: "Búsqueda",
      value: `"${filters.search}"`,
    });
  }

  if (filters.vehicleType) {
    pills.push({
      key: "vehicleType",
      label: "Tipo",
      value: VEHICLE_TYPES[filters.vehicleType as keyof typeof VEHICLE_TYPES]?.label || filters.vehicleType,
    });
  }

  if (filters.category) {
    pills.push({
      key: "category",
      label: "Categoría",
      value: VEHICLE_CATEGORIES[filters.category as keyof typeof VEHICLE_CATEGORIES]?.label || filters.category,
    });
  }

  if (filters.condition) {
    pills.push({
      key: "condition",
      label: "Condición",
      value: CONDITIONS[filters.condition as keyof typeof CONDITIONS]?.label || filters.condition,
    });
  }

  if (filters.brandId && brandName) {
    pills.push({
      key: "brandId",
      label: "Marca",
      value: brandName,
    });
  }

  if (filters.modelId && modelName) {
    pills.push({
      key: "modelId",
      label: "Modelo",
      value: modelName,
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    let priceLabel = "";
    if (filters.minPrice && filters.maxPrice) {
      priceLabel = `${formatPrice(parseInt(filters.minPrice))} - ${formatPrice(parseInt(filters.maxPrice))}`;
    } else if (filters.minPrice) {
      priceLabel = `Desde ${formatPrice(parseInt(filters.minPrice))}`;
    } else if (filters.maxPrice) {
      priceLabel = `Hasta ${formatPrice(parseInt(filters.maxPrice))}`;
    }
    pills.push({
      key: "minPrice",
      label: "Precio",
      value: priceLabel,
    });
  }

  if (filters.minYear || filters.maxYear) {
    let yearLabel = "";
    if (filters.minYear && filters.maxYear) {
      yearLabel = `${filters.minYear} - ${filters.maxYear}`;
    } else if (filters.minYear) {
      yearLabel = `Desde ${filters.minYear}`;
    } else if (filters.maxYear) {
      yearLabel = `Hasta ${filters.maxYear}`;
    }
    pills.push({
      key: "minYear",
      label: "Año",
      value: yearLabel,
    });
  }

  if (filters.fuelType) {
    pills.push({
      key: "fuelType",
      label: "Combustible",
      value: FUEL_TYPES[filters.fuelType as keyof typeof FUEL_TYPES]?.label || filters.fuelType,
    });
  }

  if (filters.transmission) {
    pills.push({
      key: "transmission",
      label: "Transmisión",
      value: TRANSMISSIONS[filters.transmission as keyof typeof TRANSMISSIONS]?.label || filters.transmission,
    });
  }

  if (filters.minMileage || filters.maxMileage) {
    let mileageLabel = "";
    if (filters.minMileage && filters.maxMileage) {
      mileageLabel = `${parseInt(filters.minMileage).toLocaleString()} - ${parseInt(filters.maxMileage).toLocaleString()} km`;
    } else if (filters.minMileage) {
      mileageLabel = `Desde ${parseInt(filters.minMileage).toLocaleString()} km`;
    } else if (filters.maxMileage) {
      mileageLabel = `Hasta ${parseInt(filters.maxMileage).toLocaleString()} km`;
    }
    pills.push({
      key: "minMileage",
      label: "Kilometraje",
      value: mileageLabel,
    });
  }

  if (filters.color) {
    pills.push({
      key: "color",
      label: "Color",
      value: COLORS[filters.color as keyof typeof COLORS]?.label || filters.color,
    });
  }

  if (filters.doors) {
    pills.push({
      key: "doors",
      label: "Puertas",
      value: `${filters.doors} puertas`,
    });
  }

  if (filters.regionId && regionName) {
    pills.push({
      key: "regionId",
      label: "Región",
      value: regionName,
    });
  }

  if (pills.length === 0) {
    return null;
  }

  const handleRemove = (key: string) => {
    if (key === "minPrice") {
      // Remove both min and max price
      const params = new URLSearchParams(searchParams.toString());
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    } else if (key === "minYear") {
      // Remove both min and max year
      const params = new URLSearchParams(searchParams.toString());
      params.delete("minYear");
      params.delete("maxYear");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    } else if (key === "minMileage") {
      // Remove both min and max mileage
      const params = new URLSearchParams(searchParams.toString());
      params.delete("minMileage");
      params.delete("maxMileage");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    } else if (key === "vehicleType") {
      // Remove vehicle type and category
      const params = new URLSearchParams(searchParams.toString());
      params.delete("vehicleType");
      params.delete("category");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    } else {
      removeFilter(key);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <span
          key={pill.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-andino-50 text-andino-700 text-sm rounded-full"
        >
          <span className="font-medium">{pill.label}:</span>
          <span>{pill.value}</span>
          <button
            onClick={() => handleRemove(pill.key)}
            className="ml-1 hover:bg-andino-100 rounded-full p-0.5"
            aria-label={`Remover filtro ${pill.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
