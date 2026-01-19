"use client";

import { useEffect, useState } from "react";
import { Select, Input } from "@/components/ui";
import type { PublishFormData } from "@/lib/validations";
import { Phone, MessageCircle } from "lucide-react";

interface Region {
  id: string;
  name: string;
  comunas: Comuna[];
}

interface Comuna {
  id: string;
  name: string;
}

interface Step6ContactProps {
  data: PublishFormData;
  onChange: (field: keyof PublishFormData, value: string | boolean) => void;
  errors: Record<string, string>;
}

export function Step6Contact({ data, onChange, errors }: Step6ContactProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // Cargar regiones
  useEffect(() => {
    async function fetchRegions() {
      try {
        const response = await fetch("/api/regiones");
        const data = await response.json();
        setRegions(data.regions || []);
      } catch (error) {
        console.error("Error fetching regions:", error);
      } finally {
        setLoadingRegions(false);
      }
    }
    fetchRegions();
  }, []);

  const selectedRegion = regions.find((r) => r.id === data.regionId);
  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));
  const comunaOptions = selectedRegion?.comunas.map((c) => ({
    value: c.id,
    label: c.name,
  })) || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">
        Ubicación y contacto
      </h3>

      {/* Ubicación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Región"
          value={data.regionId}
          onChange={(e) => {
            onChange("regionId", e.target.value);
            onChange("comunaId", ""); // Reset comuna
          }}
          options={regionOptions}
          placeholder={loadingRegions ? "Cargando..." : "Selecciona una región"}
          disabled={loadingRegions}
          error={errors.regionId}
          required
        />

        <Select
          label="Comuna (opcional)"
          value={data.comunaId}
          onChange={(e) => onChange("comunaId", e.target.value)}
          options={comunaOptions}
          placeholder={
            data.regionId ? "Selecciona una comuna" : "Primero selecciona una región"
          }
          disabled={!data.regionId}
          error={errors.comunaId}
        />
      </div>

      {/* Contacto */}
      <div className="space-y-4">
        <h4 className="font-medium text-neutral-800">Información de contacto</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              type="tel"
              inputMode="tel"
              label="Teléfono de contacto"
              value={data.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              placeholder="+56 9 1234 5678"
              error={errors.contactPhone}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <div>
            <Input
              type="tel"
              inputMode="tel"
              label="WhatsApp (opcional)"
              value={data.contactWhatsApp}
              onChange={(e) => onChange("contactWhatsApp", e.target.value)}
              placeholder="+56 9 1234 5678"
              error={errors.contactWhatsApp}
              leftIcon={<MessageCircle className="w-4 h-4" />}
              helperText="Si es diferente al teléfono de contacto"
            />
          </div>
        </div>

        {/* Mostrar teléfono */}
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.showPhone}
            onChange={(e) => onChange("showPhone", e.target.checked)}
            className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500/20"
          />
          <span className="ml-3 text-neutral-700">
            Mostrar teléfono en el anuncio
          </span>
        </label>
      </div>

      {/* Resumen */}
      <div className="bg-andino-50 rounded-lg p-4 border border-andino-200">
        <h4 className="font-medium text-andino-800 mb-2">
          Información importante
        </h4>
        <ul className="text-sm text-andino-700 space-y-1">
          <li>• Tu anuncio estará activo por 30 días</li>
          <li>• Podrás editarlo o pausarlo en cualquier momento</li>
          <li>• Recibirás notificaciones de contactos interesados</li>
        </ul>
      </div>
    </div>
  );
}
