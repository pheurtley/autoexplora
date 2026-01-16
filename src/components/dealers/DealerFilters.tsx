"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";
import { DEALER_TYPES } from "@/lib/constants";
import { ChevronDown, ChevronUp, X, Search, SlidersHorizontal } from "lucide-react";
import type { Region } from "@prisma/client";

interface DealerFiltersProps {
  regions: Pick<Region, "id" | "name" | "slug">[];
  currentFilters: Record<string, string | undefined>;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left font-medium text-neutral-900 hover:text-andino-600 transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

export function DealerFilters({
  regions,
  currentFilters,
}: DealerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentFilters.search || "");

  const regionOptions = useMemo(
    () => [
      { value: "", label: "Todas las regiones" },
      ...regions.map((r) => ({ value: r.id, label: r.name })),
    ],
    [regions]
  );

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setSearchInput("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", searchInput || null);
  };

  const hasActiveFilters = Object.keys(currentFilters).some(
    (key) => key !== "page" && key !== "sort" && currentFilters[key]
  );

  const filtersContent = (
    <>
      {/* Search */}
      <div className="pb-4 border-b border-neutral-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" size="sm" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="py-3 border-b border-neutral-200">
          <button
            onClick={clearAllFilters}
            className="text-sm text-andino-600 hover:text-andino-700 font-medium flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Dealer Type */}
      <FilterSection title="Tipo de negocio">
        <div className="space-y-2">
          {Object.entries(DEALER_TYPES).map(([key, { label, description }]) => (
            <label key={key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={currentFilters.type === key}
                onChange={() => {
                  updateFilter(
                    "type",
                    currentFilters.type === key ? null : key
                  );
                }}
                className="h-4 w-4 mt-0.5 text-andino-600 focus:ring-andino-500 border-neutral-300"
              />
              <div>
                <span className="text-sm text-neutral-700 block">{label}</span>
                <span className="text-xs text-neutral-500">{description}</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Region */}
      <FilterSection title="Región">
        <Select
          value={currentFilters.regionId || ""}
          onChange={(e) => updateFilter("regionId", e.target.value || null)}
          options={regionOptions}
        />
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full justify-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-andino-600 text-white text-xs px-2 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">{filtersContent}</div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white rounded-xl border border-neutral-200 p-4">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filtros</h2>
        {filtersContent}
      </div>
    </>
  );
}
