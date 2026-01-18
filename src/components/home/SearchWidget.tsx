"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Search, Car, Bike, Truck, ChevronDown, ChevronUp, MapPin, Calendar, DollarSign, Tag } from "lucide-react";

const vehicleTypes = [
  { id: "AUTO", label: "Autos", icon: Car },
  { id: "MOTO", label: "Motos", icon: Bike },
  { id: "COMERCIAL", label: "Comerciales", icon: Truck },
];

// Generate year options from current year to 2000
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

interface Region {
  id: string;
  name: string;
  slug: string;
}

export function SearchWidget() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("AUTO");
  const [brand, setBrand] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [region, setRegion] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Fetch regions when advanced filters are shown
  useEffect(() => {
    if (showAdvanced && regions.length === 0) {
      setLoadingRegions(true);
      fetch("/api/regiones")
        .then((res) => res.json())
        .then((data) => {
          setRegions(data.regions || []);
        })
        .catch(console.error)
        .finally(() => setLoadingRegions(false));
    }
  }, [showAdvanced, regions.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("vehicleType", selectedType);
    if (brand) params.set("brand", brand);
    if (priceMax) params.set("priceMax", priceMax);
    if (yearMin) params.set("yearMin", yearMin);
    if (region) params.set("region", region);
    router.push(`/vehiculos?${params.toString()}`);
  };

  const hasAdvancedFilters = yearMin || region;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl mx-auto animate-scale-in animation-delay-100 overflow-hidden">
      {/* Vehicle Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {vehicleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              selectedType === type.id
                ? "bg-andino-600 text-white shadow-md shadow-andino-600/25"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:shadow-sm"
            }`}
          >
            <type.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        {/* Main Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <Tag className="h-3.5 w-3.5 inline mr-1.5 text-neutral-400" />
              Marca
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
            >
              <option value="">Todas las marcas</option>
              <option value="toyota">Toyota</option>
              <option value="chevrolet">Chevrolet</option>
              <option value="hyundai">Hyundai</option>
              <option value="kia">Kia</option>
              <option value="nissan">Nissan</option>
              <option value="suzuki">Suzuki</option>
              <option value="mazda">Mazda</option>
              <option value="ford">Ford</option>
              <option value="volkswagen">Volkswagen</option>
              <option value="honda">Honda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <DollarSign className="h-3.5 w-3.5 inline mr-1.5 text-neutral-400" />
              Precio máximo
            </label>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
            >
              <option value="">Sin límite</option>
              <option value="5000000">$5.000.000</option>
              <option value="10000000">$10.000.000</option>
              <option value="15000000">$15.000.000</option>
              <option value="20000000">$20.000.000</option>
              <option value="30000000">$30.000.000</option>
              <option value="50000000">$50.000.000</option>
            </select>
          </div>

          <div className="hidden lg:block">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <Calendar className="h-3.5 w-3.5 inline mr-1.5 text-neutral-400" />
              Año desde
            </label>
            <select
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
            >
              <option value="">Cualquier año</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="hover:shadow-lg hover:shadow-andino-600/25 active:scale-[0.98] transition-all"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle - Only on mobile/tablet */}
        <div className="mt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-neutral-600 hover:text-andino-600 transition-colors"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Menos filtros
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Más filtros
                {hasAdvancedFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-andino-100 text-andino-700 text-xs rounded-full">
                    {[yearMin, region].filter(Boolean).length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Advanced Filters - Expandable on mobile, always visible on desktop */}
        <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 ${showAdvanced ? "block lg:hidden" : "hidden lg:hidden"}`}>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <Calendar className="h-3.5 w-3.5 inline mr-1.5 text-neutral-400" />
              Año desde
            </label>
            <select
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
            >
              <option value="">Cualquier año</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              <MapPin className="h-3.5 w-3.5 inline mr-1.5 text-neutral-400" />
              Región
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
              disabled={loadingRegions}
            >
              <option value="">Todas las regiones</option>
              {regions.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
