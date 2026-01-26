"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Combobox } from "@/components/ui/Combobox";

interface Brand {
  id: string;
  name: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface MicrositeVehicleFiltersProps {
  brands: Brand[];
  currentSort: string;
  sortOptions: SortOption[];
}

export function MicrositeVehicleFilters({
  brands,
  currentSort,
  sortOptions,
}: MicrositeVehicleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectClass =
    "rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/20 transition-all hover:border-neutral-400";

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-neutral-400 hidden sm:block" />

        {/* Brand */}
        <div className="w-48">
          <Combobox
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
            value={searchParams.get("brandId") || ""}
            onChange={(value) => updateParam("brandId", value)}
            placeholder="Todas las marcas"
          />
        </div>

        {/* Condition */}
        <select
          value={searchParams.get("condition") || ""}
          onChange={(e) => updateParam("condition", e.target.value)}
          className={selectClass}
        >
          <option value="">Condición</option>
          <option value="NUEVO">Nuevo</option>
          <option value="USADO">Usado</option>
        </select>

        {/* Max Price */}
        <select
          value={searchParams.get("maxPrice") || ""}
          onChange={(e) => updateParam("maxPrice", e.target.value)}
          className={selectClass}
        >
          <option value="">Precio máximo</option>
          <option value="5000000">$5.000.000</option>
          <option value="10000000">$10.000.000</option>
          <option value="15000000">$15.000.000</option>
          <option value="20000000">$20.000.000</option>
          <option value="30000000">$30.000.000</option>
          <option value="50000000">$50.000.000</option>
        </select>

        {/* Year */}
        <select
          value={searchParams.get("minYear") || ""}
          onChange={(e) => updateParam("minYear", e.target.value)}
          className={selectClass}
        >
          <option value="">Año desde</option>
          {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() + 1 - i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>

        {/* Sort - push to end */}
        <div className="ml-auto">
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className={selectClass}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
