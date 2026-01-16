"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Save,
  Settings,
  Building2,
  Mail,
  Phone,
  Globe,
  Type,
  ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SiteConfig {
  id: string;
  siteName: string;
  siteTagline: string | null;
  logo: string | null;
  favicon: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  footerText: string | null;
  updatedAt: string;
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    siteName: "",
    siteTagline: "",
    logo: "",
    favicon: "",
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    heroTitle: "",
    heroSubtitle: "",
    footerText: "",
  });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/configuracion");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setFormData({
          siteName: data.siteName || "",
          siteTagline: data.siteTagline || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
          whatsapp: data.whatsapp || "",
          address: data.address || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          twitter: data.twitter || "",
          youtube: data.youtube || "",
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          footerText: data.footerText || "",
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.siteName.trim()) {
      setError("El nombre del sitio es requerido");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al guardar la configuración");
        return;
      }

      setConfig(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al guardar la configuración");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
          <p className="text-neutral-600 mt-1">
            Personaliza la identidad y textos del sitio
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Configuración guardada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidad */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Identidad</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre del sitio *
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  placeholder="PortalAndino"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={formData.siteTagline}
                  onChange={(e) => handleChange("siteTagline", e.target.value)}
                  placeholder="Tu marketplace de vehículos en Chile"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  URL del logo
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                {formData.logo && (
                  <div className="mt-2 relative w-32 h-12 rounded border border-neutral-200 bg-neutral-50">
                    <Image
                      src={formData.logo}
                      alt="Logo preview"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  URL del favicon
                </label>
                <input
                  type="url"
                  value={formData.favicon}
                  onChange={(e) => handleChange("favicon", e.target.value)}
                  placeholder="https://ejemplo.com/favicon.ico"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                {formData.favicon && (
                  <div className="mt-2 relative w-8 h-8 rounded border border-neutral-200 bg-neutral-50">
                    <Image
                      src={formData.favicon}
                      alt="Favicon preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Mail className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Contacto</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="contacto@portalandino.cl"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="+56912345678"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Número completo con código de país, sin espacios
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Santiago, Chile"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Globe className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Redes Sociales</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/portalandino"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/portalandino"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Twitter / X
                </label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/portalandino"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={formData.youtube}
                  onChange={(e) => handleChange("youtube", e.target.value)}
                  placeholder="https://youtube.com/@portalandino"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Textos Personalizables */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Type className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Textos Personalizables</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Título del Hero Banner
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => handleChange("heroTitle", e.target.value)}
                placeholder="Encuentra tu vehículo ideal"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Subtítulo del Hero Banner
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                placeholder="Miles de autos, motos y comerciales te esperan en Chile"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Texto del Footer
              </label>
              <textarea
                value={formData.footerText}
                onChange={(e) => handleChange("footerText", e.target.value)}
                placeholder="© 2024 PortalAndino. Todos los derechos reservados."
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500 resize-none"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Last updated */}
        {config && (
          <p className="text-sm text-neutral-500 text-center">
            Última actualización: {new Date(config.updatedAt).toLocaleString("es-CL")}
          </p>
        )}

        {/* Submit button at bottom */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
