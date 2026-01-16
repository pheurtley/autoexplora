"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { DEALER_TYPES } from "@/lib/constants";

interface ActiveDealerFiltersProps {
  filters: Record<string, string | undefined>;
  regionName?: string;
}

interface FilterPill {
  key: string;
  label: string;
  value: string;
}

export function ActiveDealerFilters({
  filters,
  regionName,
}: ActiveDealerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
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

  if (filters.type) {
    pills.push({
      key: "type",
      label: "Tipo",
      value: DEALER_TYPES[filters.type as keyof typeof DEALER_TYPES]?.label || filters.type,
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
            onClick={() => removeFilter(pill.key)}
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
