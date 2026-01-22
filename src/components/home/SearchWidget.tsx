"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import {
  Search,
  Car,
  Bike,
  Truck,
  Tag,
  Layers,
  DollarSign,
  Calendar,
  Gauge,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { VEHICLE_CATEGORIES } from "@/lib/constants";

const vehicleTypes = [
  { id: "AUTO", label: "Autos", icon: Car },
  { id: "MOTO", label: "Motos", icon: Bike },
  { id: "COMERCIAL", label: "Comerciales", icon: Truck },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear + 1 - i);

const mileageOptions = [
  { value: "10000", label: "10.000 km" },
  { value: "30000", label: "30.000 km" },
  { value: "50000", label: "50.000 km" },
  { value: "80000", label: "80.000 km" },
  { value: "100000", label: "100.000 km" },
  { value: "150000", label: "150.000 km" },
  { value: "200000", label: "200.000 km" },
];

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count: { vehicles: number };
}

interface Model {
  id: string;
  name: string;
  slug: string;
  _count: { vehicles: number };
}

interface Region {
  id: string;
  name: string;
  slug: string;
}

export function SearchWidget() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("AUTO");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [maxMileage, setMaxMileage] = useState("");
  const [regionId, setRegionId] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch brands when vehicle type changes
  useEffect(() => {
    setLoadingBrands(true);
    setBrandId("");
    setModelId("");
    fetch(`/api/marcas?vehicleType=${selectedType}`)
      .then((res) => res.json())
      .then((data) => setBrands(data.brands || []))
      .catch(console.error)
      .finally(() => setLoadingBrands(false));
  }, [selectedType]);

  // Fetch models when brand changes
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId("");
      return;
    }
    setLoadingModels(true);
    setModelId("");
    fetch(`/api/marcas/${brandId}/modelos`)
      .then((res) => res.json())
      .then((data) => setModels(data.models || []))
      .catch(console.error)
      .finally(() => setLoadingModels(false));
  }, [brandId]);

  // Fetch regions when "more filters" is shown
  useEffect(() => {
    if (showMore && regions.length === 0) {
      fetch("/api/regiones")
        .then((res) => res.json())
        .then((data) => setRegions(data.regions || []))
        .catch(console.error);
    }
  }, [showMore, regions.length]);

  // Reset category when vehicle type changes
  useEffect(() => {
    setCategory("");
  }, [selectedType]);

  // Get categories for current vehicle type
  const categoriesForType = Object.entries(VEHICLE_CATEGORIES).filter(
    ([, value]) => value.type === selectedType
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("vehicleType", selectedType);
    if (brandId) params.set("brandId", brandId);
    if (modelId) params.set("modelId", modelId);
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (priceMax) params.set("maxPrice", priceMax);
    if (yearMin) params.set("minYear", yearMin);
    if (maxMileage) params.set("maxMileage", maxMileage);
    if (regionId) params.set("regionId", regionId);
    router.push(`/vehiculos?${params.toString()}`);
  };

  const moreFiltersCount = [condition, category, maxMileage, regionId].filter(Boolean).length;

  const selectClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400 text-sm";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl mx-auto animate-scale-in animation-delay-100 overflow-hidden">
      {/* Vehicle Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
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
        {/* Row 1: Brand, Model, Price, Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Brand */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              <Tag className="h-3 w-3 inline mr-1 text-neutral-400" />
              Marca
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={selectClass}
              disabled={loadingBrands}
            >
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              <Layers className="h-3 w-3 inline mr-1 text-neutral-400" />
              Modelo
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className={selectClass}
              disabled={!brandId || loadingModels}
            >
              <option value="">
                {!brandId ? "Selecciona marca" : loadingModels ? "Cargando..." : "Todos los modelos"}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              <DollarSign className="h-3 w-3 inline mr-1 text-neutral-400" />
              Precio máximo
            </label>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className={selectClass}
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

          {/* Year */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              <Calendar className="h-3 w-3 inline mr-1 text-neutral-400" />
              Año desde
            </label>
            <select
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              className={selectClass}
            >
              <option value="">Cualquier año</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* More Filters Toggle */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-andino-600 transition-colors"
          >
            {showMore ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Más filtros
            {moreFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-andino-100 text-andino-700 text-xs rounded-full">
                {moreFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: Condition, Category, Mileage, Region */}
        {showMore && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Condición
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={selectClass}
              >
                <option value="">Todas</option>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                <option value="">Todas</option>
                {categoriesForType.map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Mileage */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                <Gauge className="h-3 w-3 inline mr-1 text-neutral-400" />
                Km máximo
              </label>
              <select
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                className={selectClass}
              >
                <option value="">Sin límite</option>
                {mileageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                <MapPin className="h-3 w-3 inline mr-1 text-neutral-400" />
                Región
              </label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className={selectClass}
              >
                <option value="">Todas las regiones</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="mt-4">
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
      </form>
    </div>
  );
}
