"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Upload,
  X,
} from "lucide-react";
import { Button, Input, Select, SingleImageUpload } from "@/components/ui";
import { ImageIcon } from "lucide-react";
import { formatRut } from "@/lib/rut";

interface Region {
  id: string;
  name: string;
  comunas: { id: string; name: string }[];
}

interface DealerProfile {
  id: string;
  tradeName: string;
  businessName: string;
  rut: string;
  type: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  website: string | null;
  address: string;
  regionId: string;
  comunaId: string | null;
  logo: string | null;
  logoPublicId: string | null;
  banner: string | null;
  bannerPublicId: string | null;
  description: string | null;
  status: string;
  region: { id: string; name: string };
  comuna: { id: string; name: string } | null;
}

const typeLabels: Record<string, string> = {
  CONCESIONARIO: "Concesionario",
  AUTOMOTORA: "Automotora",
  RENT_A_CAR: "Rent a Car",
};

export default function DealerProfilePage() {
  const [dealer, setDealer] = useState<DealerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<{ id: string; name: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    tradeName: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    address: "",
    regionId: "",
    comunaId: "",
    description: "",
    logo: "",
    logoPublicId: "",
    banner: "",
    bannerPublicId: "",
  });

  useEffect(() => {
    Promise.all([fetchProfile(), fetchRegions()]).finally(() =>
      setLoading(false)
    );
  }, []);

  useEffect(() => {
    if (formData.regionId) {
      const region = regions.find((r) => r.id === formData.regionId);
      setComunas(region?.comunas || []);
    }
  }, [formData.regionId, regions]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/dealer/profile");
      if (response.ok) {
        const data = await response.json();
        setDealer(data.dealer);
        setFormData({
          tradeName: data.dealer.tradeName,
          email: data.dealer.email,
          phone: data.dealer.phone,
          whatsapp: data.dealer.whatsapp || "",
          website: data.dealer.website || "",
          address: data.dealer.address,
          regionId: data.dealer.regionId,
          comunaId: data.dealer.comunaId || "",
          description: data.dealer.description || "",
          logo: data.dealer.logo || "",
          logoPublicId: data.dealer.logoPublicId || "",
          banner: data.dealer.banner || "",
          bannerPublicId: data.dealer.bannerPublicId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/regiones");
      if (response.ok) {
        const data = await response.json();
        setRegions(data.regions || []);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/dealer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage("Perfil actualizado correctamente");
        fetchProfile();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Error al cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Perfil del Concesionario
        </h1>
        <p className="text-neutral-600 mt-1">
          Actualiza la información de tu negocio
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-green-600">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-red-600">{errorMessage}</span>
        </div>
      )}

      {/* Non-editable Info */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Información del Registro
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Esta información no puede ser modificada
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-500">
              Razón Social
            </label>
            <p className="mt-1 text-neutral-900">{dealer.businessName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-500">RUT</label>
            <p className="mt-1 text-neutral-900">{formatRut(dealer.rut)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-500">
              Tipo de Negocio
            </label>
            <p className="mt-1 text-neutral-900">
              {typeLabels[dealer.type] || dealer.type}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Info */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Información del Negocio
          </h2>

          <div className="space-y-4">
            <Input
              label="Nombre de Fantasía"
              value={formData.tradeName}
              onChange={(e) =>
                setFormData({ ...formData, tradeName: e.target.value })
              }
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Descripción
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe tu negocio..."
                className="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Contacto
          </h2>

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Teléfono"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="WhatsApp (opcional)"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Sitio Web (opcional)"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              leftIcon={<Globe className="w-4 h-4" />}
              placeholder="https://www.tuempresa.cl"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-neutral-700" />
            <h2 className="text-lg font-semibold text-neutral-900">
              Imágenes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Logo del negocio
              </label>
              <p className="text-xs text-neutral-500 mb-3">
                Recomendado: 400×400px, formato cuadrado
              </p>
              <SingleImageUpload
                value={formData.logo}
                publicId={formData.logoPublicId}
                onChange={(url, publicId) =>
                  setFormData({ ...formData, logo: url, logoPublicId: publicId })
                }
                onRemove={() =>
                  setFormData({ ...formData, logo: "", logoPublicId: "" })
                }
                folder="dealers/logos"
                aspectRatio="square"
              />
            </div>

            {/* Banner */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Banner
              </label>
              <p className="text-xs text-neutral-500 mb-3">
                Recomendado: 1200×400px, formato horizontal
              </p>
              <SingleImageUpload
                value={formData.banner}
                publicId={formData.bannerPublicId}
                onChange={(url, publicId) =>
                  setFormData({ ...formData, banner: url, bannerPublicId: publicId })
                }
                onRemove={() =>
                  setFormData({ ...formData, banner: "", bannerPublicId: "" })
                }
                folder="dealers/banners"
                aspectRatio="banner"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Ubicación
          </h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Región"
                options={regions.map((r) => ({ value: r.id, label: r.name }))}
                value={formData.regionId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regionId: e.target.value,
                    comunaId: "",
                  })
                }
              />

              <Select
                label="Comuna"
                options={comunas.map((c) => ({ value: c.id, label: c.name }))}
                value={formData.comunaId}
                onChange={(e) =>
                  setFormData({ ...formData, comunaId: e.target.value })
                }
                disabled={!formData.regionId}
              />
            </div>

            <Input
              label="Dirección"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              leftIcon={<MapPin className="w-4 h-4" />}
              placeholder="Av. Principal 1234"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
