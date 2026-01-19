"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui";
import type { PublishFormData } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";

interface Step5InfoProps {
  data: PublishFormData;
  onChange: (field: keyof PublishFormData, value: string | number | boolean) => void;
  errors: Record<string, string>;
  brandName?: string;
  modelName?: string;
  colorName?: string;
}

export function Step5Info({ data, onChange, errors, brandName, modelName, colorName }: Step5InfoProps) {
  // Generate auto title: AÑO MARCA MODELO COLOR
  const autoTitle = [
    data.year,
    brandName,
    modelName,
    colorName,
  ].filter(Boolean).join(" ");

  // Auto-update title when values change
  useEffect(() => {
    if (autoTitle && autoTitle !== data.title) {
      onChange("title", autoTitle);
    }
  }, [autoTitle]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">
        Información del anuncio
      </h3>

      {/* Título (auto-generado) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Título del anuncio
        </label>
        <div className="px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900">
          {autoTitle || <span className="text-neutral-400">Se generará automáticamente</span>}
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          El título se genera automáticamente con el año, marca, modelo y color
        </p>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Descripción (opcional)
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe el estado del vehículo, equipamiento adicional, historial de mantención, etc."
          rows={5}
          maxLength={2000}
          className={`
            w-full px-4 py-3 rounded-lg border text-neutral-900 placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-andino-500/20 focus:border-andino-500
            transition-colors resize-none
            ${errors.description ? "border-red-500" : "border-neutral-300"}
          `}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-sm text-red-500">{errors.description}</p>
          ) : (
            <p className="text-sm text-neutral-500">
              Una buena descripción ayuda a vender más rápido
            </p>
          )}
          <span className="text-sm text-neutral-400">
            {data.description.length}/2000
          </span>
        </div>
      </div>

      {/* Precio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            label="Precio (CLP)"
            value={data.price || ""}
            onChange={(e) => onChange("price", parseInt(e.target.value) || 0)}
            placeholder="Ej: 15000000"
            error={errors.price}
            required
          />
          {data.price > 0 && (
            <p className="text-sm text-andino-600 mt-1 font-medium">
              {formatPrice(data.price)}
            </p>
          )}
        </div>

        {/* Negociable */}
        <div className="flex items-center h-full pt-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.negotiable}
              onChange={(e) => onChange("negotiable", e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500/20"
            />
            <span className="ml-3 text-neutral-700">Precio negociable</span>
          </label>
        </div>
      </div>
    </div>
  );
}
