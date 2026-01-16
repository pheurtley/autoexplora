"use client";

import { Car, Bike, Truck } from "lucide-react";
import type { PublishFormData } from "@/lib/validations";
import { VEHICLE_CATEGORIES } from "@/lib/constants";

interface Step1TypeProps {
  data: PublishFormData;
  onChange: (field: keyof PublishFormData, value: string) => void;
  errors: Record<string, string>;
}

const VEHICLE_TYPES = [
  {
    value: "AUTO",
    label: "Auto",
    description: "Sedán, SUV, Hatchback, etc.",
    icon: Car,
  },
  {
    value: "MOTO",
    label: "Moto",
    description: "Calle, Deportiva, Scooter, etc.",
    icon: Bike,
  },
  {
    value: "COMERCIAL",
    label: "Comercial",
    description: "Camión, Furgón, Bus, etc.",
    icon: Truck,
  },
];

export function Step1Type({ data, onChange, errors }: Step1TypeProps) {
  // Filtrar categorías según tipo de vehículo
  const filteredCategories = Object.entries(VEHICLE_CATEGORIES).filter(
    ([key]) => {
      if (data.vehicleType === "AUTO") {
        return [
          "SEDAN",
          "HATCHBACK",
          "SUV",
          "STATION_WAGON",
          "COUPE",
          "DEPORTIVO",
          "VAN",
          "PICKUP",
        ].includes(key);
      }
      if (data.vehicleType === "MOTO") {
        return [
          "MOTO_CALLE",
          "MOTO_TOURING",
          "MOTO_DEPORTIVA",
          "MOTO_CROSS",
          "SCOOTER",
          "CUATRIMOTO",
        ].includes(key);
      }
      if (data.vehicleType === "COMERCIAL") {
        return ["CAMION", "FURGON", "BUS", "MINIBUS"].includes(key);
      }
      return false;
    }
  );

  return (
    <div className="space-y-8">
      {/* Tipo de vehículo */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          ¿Qué tipo de vehículo quieres publicar?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {VEHICLE_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = data.vehicleType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  onChange("vehicleType", type.value);
                  onChange("category", ""); // Reset category
                }}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all
                  ${
                    isSelected
                      ? "border-andino-600 bg-andino-50 ring-2 ring-andino-600/20"
                      : "border-neutral-200 hover:border-andino-300 hover:bg-neutral-50"
                  }
                `}
              >
                <Icon
                  className={`w-8 h-8 mb-3 ${
                    isSelected ? "text-andino-600" : "text-neutral-400"
                  }`}
                />
                <div
                  className={`font-semibold ${
                    isSelected ? "text-andino-700" : "text-neutral-900"
                  }`}
                >
                  {type.label}
                </div>
                <div className="text-sm text-neutral-500 mt-1">
                  {type.description}
                </div>
              </button>
            );
          })}
        </div>
        {errors.vehicleType && (
          <p className="text-red-500 text-sm mt-2">{errors.vehicleType}</p>
        )}
      </div>

      {/* Categoría */}
      {data.vehicleType && (
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Selecciona la categoría
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredCategories.map(([key, value]) => {
              const isSelected = data.category === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange("category", key)}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${
                      isSelected
                        ? "border-andino-600 bg-andino-50 text-andino-700 font-semibold"
                        : "border-neutral-200 hover:border-andino-300 text-neutral-700"
                    }
                  `}
                >
                  {value.label}
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="text-red-500 text-sm mt-2">{errors.category}</p>
          )}
        </div>
      )}
    </div>
  );
}
