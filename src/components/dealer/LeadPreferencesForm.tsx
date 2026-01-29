"use client";

import { useState, useEffect } from "react";
import { X, Search, Save } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";

interface Brand {
  id: string;
  name: string;
  models: { id: string; name: string }[];
}

interface LeadPreferencesFormProps {
  leadId: string;
  initialData?: {
    brandIds: string[];
    modelIds: string[];
    minPrice: number | null;
    maxPrice: number | null;
    minYear: number | null;
    maxYear: number | null;
    vehicleType: string | null;
    condition: string | null;
  };
  onSave: () => void;
  onCancel: () => void;
}

const VEHICLE_TYPE_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "AUTO", label: "Auto" },
  { value: "MOTO", label: "Moto" },
  { value: "COMERCIAL", label: "Comercial" },
];

const CONDITION_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "NUEVO", label: "Nuevo" },
  { value: "USADO", label: "Usado" },
];

export function LeadPreferencesForm({
  leadId,
  initialData,
  onSave,
  onCancel,
}: LeadPreferencesFormProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialData?.brandIds || []
  );
  const [selectedModels, setSelectedModels] = useState<string[]>(
    initialData?.modelIds || []
  );
  const [minPrice, setMinPrice] = useState(initialData?.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(initialData?.maxPrice?.toString() || "");
  const [minYear, setMinYear] = useState(initialData?.minYear?.toString() || "");
  const [maxYear, setMaxYear] = useState(initialData?.maxYear?.toString() || "");
  const [vehicleType, setVehicleType] = useState(initialData?.vehicleType || "");
  const [condition, setCondition] = useState(initialData?.condition || "");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          setBrands(data.brands || []);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandIds: selectedBrands,
          modelIds: selectedModels,
          minPrice: minPrice ? parseInt(minPrice) : null,
          maxPrice: maxPrice ? parseInt(maxPrice) : null,
          minYear: minYear ? parseInt(minYear) : null,
          maxYear: maxYear ? parseInt(maxYear) : null,
          vehicleType: vehicleType || null,
          condition: condition || null,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar");
      }
    } catch {
      setError("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const availableModels = brands
    .filter((b) => selectedBrands.includes(b.id))
    .flatMap((b) => b.models);

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "", label: "Cualquiera" },
    ...Array.from({ length: 30 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    })),
  ];

  return (
    <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-andino-600" />
          <h4 className="font-medium text-neutral-900">Preferencias de Búsqueda</h4>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brands */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
            Marcas de interés
          </label>
          <div className="flex flex-wrap gap-2">
            {brands.slice(0, 12).map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() =>
                  setSelectedBrands((prev) =>
                    prev.includes(brand.id)
                      ? prev.filter((id) => id !== brand.id)
                      : [...prev, brand.id]
                  )
                }
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  selectedBrands.includes(brand.id)
                    ? "bg-andino-100 text-andino-700 border-andino-300"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                } border`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Models (if brands selected) */}
        {availableModels.length > 0 && (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
              Modelos específicos
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() =>
                    setSelectedModels((prev) =>
                      prev.includes(model.id)
                        ? prev.filter((id) => id !== model.id)
                        : [...prev, model.id]
                    )
                  }
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedModels.includes(model.id)
                      ? "bg-andino-100 text-andino-700"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  } border border-neutral-200`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
            Rango de Precio
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                $
              </span>
              <Input
                type="number"
                placeholder="Mínimo"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="pl-7"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                $
              </span>
              <Input
                type="number"
                placeholder="Máximo"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </div>

        {/* Year Range */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
            Rango de Año
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Select
              options={yearOptions}
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
            />
            <Select
              options={yearOptions}
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
            />
          </div>
        </div>

        {/* Type and Condition */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
              Tipo
            </label>
            <Select
              options={VEHICLE_TYPE_OPTIONS}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
              Condición
            </label>
            <Select
              options={CONDITION_OPTIONS}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
