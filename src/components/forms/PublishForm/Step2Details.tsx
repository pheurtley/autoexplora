"use client";

import { useEffect, useState } from "react";
import { Select, Input } from "@/components/ui";
import type { PublishFormData } from "@/lib/validations";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Model {
  id: string;
  name: string;
  slug: string;
}

interface Step2DetailsProps {
  data: PublishFormData;
  onChange: (field: keyof PublishFormData, value: string | number) => void;
  errors: Record<string, string>;
}

const CONDITIONS = [
  { value: "USADO", label: "Usado" },
  { value: "NUEVO", label: "Nuevo" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export function Step2Details({ data, onChange, errors }: Step2DetailsProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  // Cargar marcas
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/marcas");
        const json = await response.json();
        setBrands(json.brands || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    }
    fetchBrands();
  }, []);

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (!data.brandId) {
      setModels([]);
      return;
    }

    async function fetchModels() {
      setLoadingModels(true);
      try {
        const response = await fetch(`/api/marcas/${data.brandId}/modelos`);
        const json = await response.json();
        setModels(json.models || []);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoadingModels(false);
      }
    }
    fetchModels();
  }, [data.brandId]);

  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));
  const modelOptions = models.map((m) => ({ value: m.id, label: m.name }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">
        Detalles del vehículo
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Marca */}
        <Select
          label="Marca"
          value={data.brandId}
          onChange={(e) => {
            onChange("brandId", e.target.value);
            onChange("modelId", ""); // Reset model
          }}
          options={brandOptions}
          placeholder={loadingBrands ? "Cargando..." : "Selecciona una marca"}
          disabled={loadingBrands}
          error={errors.brandId}
          required
        />

        {/* Modelo */}
        <Select
          label="Modelo"
          value={data.modelId}
          onChange={(e) => onChange("modelId", e.target.value)}
          options={modelOptions}
          placeholder={
            loadingModels
              ? "Cargando..."
              : data.brandId
              ? "Selecciona un modelo"
              : "Primero selecciona una marca"
          }
          disabled={!data.brandId || loadingModels}
          error={errors.modelId}
          required
        />

        {/* Año */}
        <Select
          label="Año"
          value={String(data.year)}
          onChange={(e) => onChange("year", parseInt(e.target.value))}
          options={YEARS}
          error={errors.year}
          required
        />

        {/* Condición */}
        <Select
          label="Condición"
          value={data.condition}
          onChange={(e) => onChange("condition", e.target.value)}
          options={CONDITIONS}
          error={errors.condition}
          required
        />

        {/* Kilometraje */}
        <div className="sm:col-span-2">
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            label="Kilometraje"
            value={data.mileage || ""}
            onChange={(e) => onChange("mileage", parseInt(e.target.value) || 0)}
            onKeyDown={(e) => {
              // Permitir: backspace, delete, tab, escape, enter, flechas
              if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                return;
              }
              // Bloquear si no es número
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="Ej: 50000"
            error={errors.mileage}
            helperText="Ingresa 0 si el vehículo es nuevo"
            required
          />
        </div>
      </div>
    </div>
  );
}
