"use client";

import { useState, useEffect } from "react";
import { Input, Select } from "@/components/ui";
import { MapPin, Mail, Phone, Globe, MessageCircle } from "lucide-react";
import { DealerRegistrationFormData } from "@/lib/validations/dealer";

interface Region {
  id: string;
  name: string;
  comunas: { id: string; name: string }[];
}

interface Step3LocationProps {
  formData: DealerRegistrationFormData;
  updateFormData: (data: Partial<DealerRegistrationFormData>) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
}

export function Step3Location({
  formData,
  updateFormData,
  errors,
  clearError,
}: Step3LocationProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<{ id: string; name: string }[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (formData.regionId) {
      const region = regions.find((r) => r.id === formData.regionId);
      setComunas(region?.comunas || []);
    } else {
      setComunas([]);
    }
  }, [formData.regionId, regions]);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/regiones");
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    updateFormData({ regionId, comunaId: "" });
    clearError("regionId");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Ubicación y Contacto
        </h2>
        <p className="mt-2 text-neutral-600">
          Ingresa la dirección y datos de contacto de tu negocio
        </p>
      </div>

      <div className="space-y-4">
        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Región"
            options={regions.map((r) => ({ value: r.id, label: r.name }))}
            value={formData.regionId}
            onChange={handleRegionChange}
            placeholder="Selecciona una región"
            disabled={loadingRegions}
            error={errors.regionId}
          />

          <Select
            label="Comuna"
            options={comunas.map((c) => ({ value: c.id, label: c.name }))}
            value={formData.comunaId}
            onChange={(e) => {
              updateFormData({ comunaId: e.target.value });
              clearError("comunaId");
            }}
            placeholder="Selecciona una comuna"
            disabled={!formData.regionId || comunas.length === 0}
            error={errors.comunaId}
          />
        </div>

        <Input
          label="Dirección"
          placeholder="Av. Principal 1234, Local 5"
          value={formData.address}
          onChange={(e) => {
            updateFormData({ address: e.target.value });
            clearError("address");
          }}
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.address}
          helperText="Dirección completa de tu local comercial"
        />

        {/* Contact */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Datos de Contacto
          </h3>

          <div className="space-y-4">
            <Input
              label="Email de Contacto"
              type="email"
              placeholder="contacto@tuempresa.cl"
              value={formData.email}
              onChange={(e) => {
                updateFormData({ email: e.target.value });
                clearError("email");
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email}
              helperText="Email para consultas de clientes"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => {
                  updateFormData({ phone: e.target.value });
                  clearError("phone");
                }}
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone}
              />

              <Input
                label="WhatsApp (opcional)"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={formData.whatsapp}
                onChange={(e) => {
                  updateFormData({ whatsapp: e.target.value });
                  clearError("whatsapp");
                }}
                leftIcon={<MessageCircle className="w-4 h-4" />}
                error={errors.whatsapp}
              />
            </div>

            <Input
              label="Sitio Web (opcional)"
              type="url"
              placeholder="https://www.tuempresa.cl"
              value={formData.website}
              onChange={(e) => {
                updateFormData({ website: e.target.value });
                clearError("website");
              }}
              leftIcon={<Globe className="w-4 h-4" />}
              error={errors.website}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
