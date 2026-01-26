"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";
import { Combobox } from "@/components/ui/Combobox";
import {
  VEHICLE_TYPES,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CONDITIONS,
  COLORS,
  MIN_YEAR,
  MAX_YEAR,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, ChevronUp, X, Search, SlidersHorizontal } from "lucide-react";
import type { Brand, Model, Region } from "@prisma/client";

interface BrandWithModels extends Brand {
  models: Pick<Model, "id" | "name" | "slug">[];
}

interface VehicleFiltersProps {
  brands: BrandWithModels[];
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

export function VehicleFilters({
  brands,
  regions,
  currentFilters,
}: VehicleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentFilters.search || "");

  const selectedBrand = brands.find((b) => b.id === currentFilters.brandId);
  const models = selectedBrand?.models || [];

  // Prepare options for Combobox components
  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.id, label: b.name })),
    [brands]
  );

  const modelOptions = useMemo(
    () => models.map((m) => ({ value: m.id, label: m.name })),
    [models]
  );

  const regionOptions = useMemo(
    () => [
      { value: "", label: "Todas las regiones" },
      ...regions.map((r) => ({ value: r.id, label: r.name })),
    ],
    [regions]
  );

  const years = useMemo(() => {
    const yearArray = Array.from(
      { length: MAX_YEAR - MIN_YEAR + 1 },
      (_, i) => MAX_YEAR - i
    );
    return yearArray;
  }, []);

  const yearFromOptions = useMemo(
    () => [
      { value: "", label: "Desde" },
      ...years.map((y) => ({ value: y.toString(), label: y.toString() })),
    ],
    [years]
  );

  const yearToOptions = useMemo(
    () => [
      { value: "", label: "Hasta" },
      ...years.map((y) => ({ value: y.toString(), label: y.toString() })),
    ],
    [years]
  );

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    params.delete("page");
    // If brand changes, reset model
    if (key === "brandId") {
      params.delete("modelId");
    }
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
            placeholder="Buscar..."
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

      {/* Vehicle Type */}
      <FilterSection title="Tipo de vehículo">
        <div className="space-y-2">
          {Object.entries(VEHICLE_TYPES).map(([key, { label }]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vehicleType"
                checked={currentFilters.vehicleType === key}
                onChange={() => {
                  updateFilter(
                    "vehicleType",
                    currentFilters.vehicleType === key ? null : key
                  );
                  // Reset category when type changes
                  if (currentFilters.vehicleType !== key) {
                    updateFilter("category", null);
                  }
                }}
                className="h-4 w-4 text-andino-600 focus:ring-andino-500 border-neutral-300"
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category - shows only when vehicle type is selected */}
      {currentFilters.vehicleType && (
        <FilterSection title="Categoría">
          <div className="space-y-2">
            {Object.entries(VEHICLE_CATEGORIES)
              .filter(([, config]) => config.type === currentFilters.vehicleType)
              .map(([key, { label }]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={currentFilters.category === key}
                    onChange={() =>
                      updateFilter(
                        "category",
                        currentFilters.category === key ? null : key
                      )
                    }
                    className="h-4 w-4 text-andino-600 focus:ring-andino-500 border-neutral-300"
                  />
                  <span className="text-sm text-neutral-700">{label}</span>
                </label>
              ))}
          </div>
        </FilterSection>
      )}

      {/* Condition */}
      <FilterSection title="Condición">
        <div className="space-y-2">
          {Object.entries(CONDITIONS).map(([key, { label }]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                checked={currentFilters.condition === key}
                onChange={() =>
                  updateFilter(
                    "condition",
                    currentFilters.condition === key ? null : key
                  )
                }
                className="h-4 w-4 text-andino-600 focus:ring-andino-500 border-neutral-300"
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand & Model */}
      <FilterSection title="Marca y Modelo">
        <div className="space-y-3">
          <Combobox
            options={brandOptions}
            value={currentFilters.brandId || ""}
            onChange={(value) => updateFilter("brandId", value || null)}
            placeholder="Todas las marcas"
          />

          <Combobox
            options={modelOptions}
            value={currentFilters.modelId || ""}
            onChange={(value) => updateFilter("modelId", value || null)}
            placeholder="Todos los modelos"
            disabled={!currentFilters.brandId}
          />
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Precio">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Mínimo</label>
              <Input
                type="number"
                placeholder="$ Min"
                value={currentFilters.minPrice || ""}
                onChange={(e) => updateFilter("minPrice", e.target.value || null)}
                min={0}
                step={1000000}
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Máximo</label>
              <Input
                type="number"
                placeholder="$ Max"
                value={currentFilters.maxPrice || ""}
                onChange={(e) => updateFilter("maxPrice", e.target.value || null)}
                min={0}
                step={1000000}
              />
            </div>
          </div>
          {(currentFilters.minPrice || currentFilters.maxPrice) && (
            <p className="text-xs text-neutral-500">
              {currentFilters.minPrice && formatPrice(parseInt(currentFilters.minPrice))}
              {currentFilters.minPrice && currentFilters.maxPrice && " - "}
              {currentFilters.maxPrice && formatPrice(parseInt(currentFilters.maxPrice))}
            </p>
          )}
        </div>
      </FilterSection>

      {/* Year Range */}
      <FilterSection title="Año">
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={currentFilters.minYear || ""}
            onChange={(e) => updateFilter("minYear", e.target.value || null)}
            options={yearFromOptions}
          />
          <Select
            value={currentFilters.maxYear || ""}
            onChange={(e) => updateFilter("maxYear", e.target.value || null)}
            options={yearToOptions}
          />
        </div>
      </FilterSection>

      {/* Mileage Range */}
      <FilterSection title="Kilometraje" defaultOpen={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Mínimo</label>
              <Input
                type="number"
                placeholder="0 km"
                value={currentFilters.minMileage || ""}
                onChange={(e) => updateFilter("minMileage", e.target.value || null)}
                min={0}
                step={10000}
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Máximo</label>
              <Input
                type="number"
                placeholder="Max km"
                value={currentFilters.maxMileage || ""}
                onChange={(e) => updateFilter("maxMileage", e.target.value || null)}
                min={0}
                step={10000}
              />
            </div>
          </div>
          {(currentFilters.minMileage || currentFilters.maxMileage) && (
            <p className="text-xs text-neutral-500">
              {currentFilters.minMileage && `${parseInt(currentFilters.minMileage).toLocaleString()} km`}
              {currentFilters.minMileage && currentFilters.maxMileage && " - "}
              {currentFilters.maxMileage && `${parseInt(currentFilters.maxMileage).toLocaleString()} km`}
            </p>
          )}
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Combustible" defaultOpen={false}>
        <div className="space-y-2">
          {Object.entries(FUEL_TYPES).map(([key, { label }]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fuelType"
                checked={currentFilters.fuelType === key}
                onChange={() =>
                  updateFilter(
                    "fuelType",
                    currentFilters.fuelType === key ? null : key
                  )
                }
                className="h-4 w-4 text-andino-600 focus:ring-andino-500 border-neutral-300"
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmisión" defaultOpen={false}>
        <div className="space-y-2">
          {Object.entries(TRANSMISSIONS).map(([key, { label }]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transmission"
                checked={currentFilters.transmission === key}
                onChange={() =>
                  updateFilter(
                    "transmission",
                    currentFilters.transmission === key ? null : key
                  )
                }
                className="h-4 w-4 text-andino-600 focus:ring-andino-500 border-neutral-300"
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(COLORS).map(([key, { label, hex }]) => (
            <label
              key={key}
              className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-colors ${
                currentFilters.color === key
                  ? "border-andino-500 bg-andino-50"
                  : "border-transparent hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="color"
                checked={currentFilters.color === key}
                onChange={() =>
                  updateFilter(
                    "color",
                    currentFilters.color === key ? null : key
                  )
                }
                className="sr-only"
              />
              <span
                className="w-4 h-4 rounded-full border border-neutral-300 shrink-0"
                style={{ backgroundColor: hex }}
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Doors */}
      <FilterSection title="Puertas" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 5].map((doors) => (
            <button
              key={doors}
              type="button"
              onClick={() =>
                updateFilter(
                  "doors",
                  currentFilters.doors === String(doors) ? null : String(doors)
                )
              }
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                currentFilters.doors === String(doors)
                  ? "border-andino-500 bg-andino-50 text-andino-700"
                  : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
              }`}
            >
              {doors}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Region */}
      <FilterSection title="Región" defaultOpen={false}>
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
