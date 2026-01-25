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

interface Version {
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
  const [versions, setVersions] = useState<Version[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Cargar marcas filtradas por tipo de vehículo
  useEffect(() => {
    async function fetchBrands() {
      setLoadingBrands(true);
      try {
        const params = data.vehicleType ? `?vehicleType=${data.vehicleType}` : "";
        const response = await fetch(`/api/marcas${params}`);
        const json = await response.json();
        setBrands(json.brands || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    }
    fetchBrands();
  }, [data.vehicleType]);

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (!data.brandId) {
      setModels([]);
      setVersions([]);
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

  // Cargar versiones cuando cambia el modelo
  useEffect(() => {
    if (!data.brandId || !data.modelId) {
      setVersions([]);
      return;
    }

    async function fetchVersions() {
      setLoadingVersions(true);
      try {
        const response = await fetch(`/api/marcas/${data.brandId}/modelos/${data.modelId}/versiones`);
        const json = await response.json();
        setVersions(json.versions || []);
      } catch (error) {
        console.error("Error fetching versions:", error);
      } finally {
        setLoadingVersions(false);
      }
    }
    fetchVersions();
  }, [data.brandId, data.modelId]);

  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));
  const modelOptions = models.map((m) => ({ value: m.id, label: m.name }));
  const versionOptions = versions.map((v) => ({ value: v.id, label: v.name }));

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
            onChange("versionId", ""); // Reset version
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
          onChange={(e) => {
            onChange("modelId", e.target.value);
            onChange("versionId", ""); // Reset version
          }}
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

        {/* Versión (opcional) */}
        {data.modelId && versions.length > 0 && (
          <Select
            label="Versión"
            value={data.versionId}
            onChange={(e) => onChange("versionId", e.target.value)}
            options={versionOptions}
            placeholder={
              loadingVersions
                ? "Cargando..."
                : "Selecciona una versión (opcional)"
            }
            disabled={!data.modelId || loadingVersions}
            error={errors.versionId}
          />
        )}

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
          onChange={(e) => {
            const newCondition = e.target.value;
            onChange("condition", newCondition);
            // Auto-set mileage to 0 when condition is "Nuevo"
            if (newCondition === "NUEVO") {
              onChange("mileage", 0);
            }
          }}
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
            value={data.mileage !== undefined ? data.mileage : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                onChange("mileage", undefined as unknown as number);
              } else {
                onChange("mileage", parseInt(value));
              }
            }}
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
            helperText={data.condition === "NUEVO" ? "Se ha establecido en 0 automáticamente" : "Ingresa 0 si el vehículo es nuevo"}
            required
            disabled={data.condition === "NUEVO"}
          />
        </div>
      </div>
    </div>
  );
}
