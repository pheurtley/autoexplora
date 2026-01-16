"use client";

import { Input } from "@/components/ui";
import { Building, FileText, Hash } from "lucide-react";
import { DealerRegistrationFormData } from "@/lib/validations/dealer";
import { formatRut, validateRut } from "@/lib/rut";
import { useState } from "react";

interface Step2BusinessProps {
  formData: DealerRegistrationFormData;
  updateFormData: (data: Partial<DealerRegistrationFormData>) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
}

export function Step2Business({
  formData,
  updateFormData,
  errors,
  clearError,
}: Step2BusinessProps) {
  const [rutInput, setRutInput] = useState(() =>
    formData.rut ? formatRut(formData.rut) : formData.rut
  );
  const [rutValid, setRutValid] = useState<boolean | null>(null);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRutInput(value);
    clearError("rut");

    // Only validate and format if there's input
    if (value.length >= 8) {
      const isValid = validateRut(value);
      setRutValid(isValid);
      if (isValid) {
        const formatted = formatRut(value);
        setRutInput(formatted);
        updateFormData({ rut: value });
      }
    } else {
      setRutValid(null);
      updateFormData({ rut: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Datos de la Empresa
        </h2>
        <p className="mt-2 text-neutral-600">
          Ingresa la información legal de tu negocio
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Razón Social"
          placeholder="Automotora Chile SpA"
          value={formData.businessName}
          onChange={(e) => {
            updateFormData({ businessName: e.target.value });
            clearError("businessName");
          }}
          leftIcon={<FileText className="w-4 h-4" />}
          error={errors.businessName}
          helperText="Nombre legal de tu empresa según el SII"
        />

        <Input
          label="Nombre de Fantasía"
          placeholder="Automotora Chile"
          value={formData.tradeName}
          onChange={(e) => {
            updateFormData({ tradeName: e.target.value });
            clearError("tradeName");
          }}
          leftIcon={<Building className="w-4 h-4" />}
          error={errors.tradeName}
          helperText="Nombre comercial con el que se conoce tu negocio"
        />

        <div>
          <Input
            label="RUT de la Empresa"
            placeholder="76.123.456-7"
            value={rutInput}
            onChange={handleRutChange}
            leftIcon={<Hash className="w-4 h-4" />}
            error={errors.rut}
            className={
              rutValid === true
                ? "border-success focus:border-success focus:ring-success/20"
                : rutValid === false
                ? "border-error focus:border-error focus:ring-error/20"
                : ""
            }
          />
          {rutValid === true && !errors.rut && (
            <p className="mt-1 text-sm text-success">RUT válido</p>
          )}
          {rutValid === false && !errors.rut && (
            <p className="mt-1 text-sm text-error">
              RUT inválido. Verifica el dígito verificador.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Importante:</strong> Asegúrate de ingresar el RUT correcto de
          tu empresa. Este dato será verificado durante el proceso de
          aprobación.
        </p>
      </div>
    </div>
  );
}
