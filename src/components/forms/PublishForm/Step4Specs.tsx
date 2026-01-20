"use client";

import { Select, Input } from "@/components/ui";
import type { PublishFormData } from "@/lib/validations";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  COLORS,
  TRACTIONS,
  TRACTION_CATEGORIES,
  toSelectOptions,
} from "@/lib/constants";

interface Step4SpecsProps {
  data: PublishFormData;
  onChange: (field: keyof PublishFormData, value: string | number | undefined) => void;
  errors: Record<string, string>;
}

// Use the utility function to convert constants to select options
const fuelOptions = toSelectOptions(FUEL_TYPES);
const transmissionOptions = toSelectOptions(TRANSMISSIONS);
const colorOptions = toSelectOptions(COLORS);
const tractionOptions = toSelectOptions(TRACTIONS);

const DOORS = [
  { value: "2", label: "2 puertas" },
  { value: "3", label: "3 puertas" },
  { value: "4", label: "4 puertas" },
  { value: "5", label: "5 puertas" },
];

export function Step4Specs({ data, onChange, errors }: Step4SpecsProps) {
  const isMoto = data.vehicleType === "MOTO";
  // Show traction for SUV, Pickup, and commercial vehicles (trucks, vans)
  const showTraction = !isMoto && (
    TRACTION_CATEGORIES.includes(data.category as typeof TRACTION_CATEGORIES[number]) ||
    data.vehicleType === "COMERCIAL"
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">
        Especificaciones técnicas
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Combustible */}
        <Select
          label="Tipo de combustible"
          value={data.fuelType}
          onChange={(e) => onChange("fuelType", e.target.value)}
          options={fuelOptions}
          error={errors.fuelType}
          required
        />

        {/* Transmisión */}
        <Select
          label="Transmisión"
          value={data.transmission}
          onChange={(e) => onChange("transmission", e.target.value)}
          options={transmissionOptions}
          error={errors.transmission}
          required
        />

        {/* Color */}
        <Select
          label="Color"
          value={data.color}
          onChange={(e) => onChange("color", e.target.value)}
          options={colorOptions}
          placeholder="Selecciona un color"
          error={errors.color}
          required
        />

        {/* Puertas - solo para autos y comerciales, no motos */}
        {!isMoto && (
          <Select
            label="Puertas (opcional)"
            value={data.doors ? String(data.doors) : ""}
            onChange={(e) =>
              onChange("doors", e.target.value ? parseInt(e.target.value) : undefined)
            }
            options={DOORS}
            placeholder="Selecciona cantidad"
            error={errors.doors}
          />
        )}

        {/* Tracción - solo para SUV, Pickup y Comerciales */}
        {showTraction && (
          <Select
            label="Tracción (opcional)"
            value={data.traction}
            onChange={(e) => onChange("traction", e.target.value)}
            options={tractionOptions}
            placeholder="Selecciona tipo de tracción"
            error={errors.traction}
          />
        )}

        {/* Cilindrada / Motor */}
        <div className="sm:col-span-2">
          <Input
            label="Cilindrada / Motor (opcional)"
            value={data.engineSize}
            onChange={(e) => onChange("engineSize", e.target.value)}
            placeholder="Ej: 2.0L, 1600cc, 150cc, etc."
            error={errors.engineSize}
          />
        </div>
      </div>
    </div>
  );
}
