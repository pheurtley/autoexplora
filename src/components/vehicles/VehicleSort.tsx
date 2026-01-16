"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui";

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "year_desc", label: "Año: más nuevo" },
  { value: "mileage_asc", label: "Menor kilometraje" },
];

interface VehicleSortProps {
  currentSort: string;
}

export function VehicleSort({ currentSort }: VehicleSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page"); // Reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <label htmlFor="sort" className="text-sm text-neutral-600 whitespace-nowrap">
        Ordenar por:
      </label>
      <Select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        options={SORT_OPTIONS}
        className="w-auto min-w-[180px]"
      />
    </div>
  );
}
