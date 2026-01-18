"use client";

import { Car, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealerRegistrationFormData } from "@/lib/validations/dealer";

interface Step1TypeProps {
  formData: DealerRegistrationFormData;
  updateFormData: (data: Partial<DealerRegistrationFormData>) => void;
  errors: Record<string, string>;
}

const dealerTypes = [
  {
    value: "AUTOMOTORA",
    label: "Automotora",
    description: "Venta de vehículos nuevos y usados",
    icon: Car,
  },
  {
    value: "RENT_A_CAR",
    label: "Rent a Car",
    description: "Arriendo de vehículos con opción de venta",
    icon: Key,
  },
];

export function Step1Type({ formData, updateFormData, errors }: Step1TypeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Tipo de Negocio
        </h2>
        <p className="mt-2 text-neutral-600">
          Selecciona el tipo de negocio que mejor describe tu empresa
        </p>
      </div>

      <div className="grid gap-4">
        {dealerTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = formData.type === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFormData({ type: type.value })}
              className={cn(
                "w-full p-6 rounded-xl border-2 text-left transition-all",
                "hover:border-andino-300 hover:bg-andino-50/50",
                isSelected
                  ? "border-andino-600 bg-andino-50 ring-2 ring-andino-600/20"
                  : "border-neutral-200 bg-white"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    isSelected
                      ? "bg-andino-600 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      "font-semibold text-lg",
                      isSelected ? "text-andino-700" : "text-neutral-900"
                    )}
                  >
                    {type.label}
                  </h3>
                  <p className="mt-1 text-neutral-600">{type.description}</p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? "border-andino-600 bg-andino-600"
                      : "border-neutral-300"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {errors.type && (
        <p className="text-sm text-error text-center">{errors.type}</p>
      )}
    </div>
  );
}
