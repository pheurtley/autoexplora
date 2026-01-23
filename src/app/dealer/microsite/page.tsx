"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Palette,
  Phone,
  BarChart3,
  FileText,
  Save,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui";

interface SiteConfig {
  id: string;
  dealerId: string;
  isActive: boolean;
  primaryColor: string;
  accentColor: string;
  logo: string | null;
  favicon: string | null;
  showWhatsAppButton: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsApp: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  showFeaturedVehicles: boolean;
  featuredVehiclesLimit: number;
  pages: { id: string; title: string; slug: string; isPublished: boolean }[];
}

type Tab = "general" | "branding" | "contact" | "analytics";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "branding", label: "Apariencia", icon: Palette },
  { id: "contact", label: "Contacto", icon: Phone },
  { id: "analytics", label: "SEO & Analytics", icon: BarChart3 },
];

export default function DealerMicrositePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [isActive, setIsActive] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#f97316");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [showFeaturedVehicles, setShowFeaturedVehicles] = useState(true);
  const [featuredVehiclesLimit, setFeaturedVehiclesLimit] = useState(8);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");

  useEffect(() => {
    fetch("/api/dealer/microsite")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          const c = data.config;
          setConfig(c);
          setIsActive(c.isActive);
          setPrimaryColor(c.primaryColor);
          setAccentColor(c.accentColor);
          setHeroTitle(c.heroTitle || "");
          setHeroSubtitle(c.heroSubtitle || "");
          setShowFeaturedVehicles(c.showFeaturedVehicles);
          setFeaturedVehiclesLimit(c.featuredVehiclesLimit);
          setShowWhatsAppButton(c.showWhatsAppButton);
          setContactEmail(c.contactEmail || "");
          setContactPhone(c.contactPhone || "");
          setContactWhatsApp(c.contactWhatsApp || "");
          setMetaTitle(c.metaTitle || "");
          setMetaDescription(c.metaDescription || "");
          setGoogleAnalyticsId(c.googleAnalyticsId || "");
          setMetaPixelId(c.metaPixelId || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/dealer/microsite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive,
          primaryColor,
          accentColor,
          heroTitle: heroTitle || null,
          heroSubtitle: heroSubtitle || null,
          showFeaturedVehicles,
          featuredVehiclesLimit,
          showWhatsAppButton,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          contactWhatsApp: contactWhatsApp || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          googleAnalyticsId: googleAnalyticsId || null,
          metaPixelId: metaPixelId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSuccessMessage("Cambios guardados correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 text-sm focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mi Sitio Web</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Configura tu micrositio personalizado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dealer/microsite/dominios"
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Globe className="h-4 w-4" />
            Dominios
          </Link>
          <Link
            href="/dealer/microsite/paginas"
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Páginas
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Active Toggle */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isActive ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-neutral-400" />
            )}
            <div>
              <p className="font-medium text-neutral-900">
                {isActive ? "Sitio activo" : "Sitio inactivo"}
              </p>
              <p className="text-xs text-neutral-500">
                {isActive
                  ? "Tu sitio es visible para el público"
                  : "Tu sitio no es visible aún"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isActive && config && (
              <a
                href={`https://${config.dealerId}.autoexplora.cl`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-andino-600 hover:text-andino-700 flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver sitio
              </a>
            )}
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-green-500" : "bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-andino-600 text-andino-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">
                Sección Hero
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Título principal
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Bienvenido a [Tu Automotora]"
                    className={inputClass}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Si está vacío, se usará el nombre de tu automotora
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Encuentra el vehículo perfecto para ti"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">
                Vehículos Destacados
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFeaturedVehicles}
                    onChange={(e) => setShowFeaturedVehicles(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  />
                  <span className="text-sm text-neutral-700">
                    Mostrar vehículos destacados en la página de inicio
                  </span>
                </label>
                {showFeaturedVehicles && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Cantidad de vehículos
                    </label>
                    <select
                      value={featuredVehiclesLimit}
                      onChange={(e) =>
                        setFeaturedVehiclesLimit(parseInt(e.target.value))
                      }
                      className={inputClass}
                    >
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Colores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Color primario
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 rounded-lg border border-neutral-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Se usa en el hero, botones y enlaces
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Color de acento
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-10 rounded-lg border border-neutral-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            {/* Color Preview */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">
                Vista previa
              </h3>
              <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div
                  className="p-6 text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="text-white font-bold text-lg">
                    {heroTitle || "Tu Automotora"}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    {heroSubtitle || "Subtítulo del hero"}
                  </p>
                  <button
                    className="mt-3 px-4 py-2 bg-white rounded-lg text-sm font-medium"
                    style={{ color: primaryColor }}
                  >
                    Ver Vehículos
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWhatsAppButton}
                  onChange={(e) => setShowWhatsAppButton(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                />
                <span className="text-sm text-neutral-700">
                  Mostrar botón de WhatsApp en el footer
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">
                Información de Contacto
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Esta información se mostrará en tu sitio web y se usará para los
                botones de contacto.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contacto@tuautomotora.cl"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+56 2 1234 5678"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={contactWhatsApp}
                    onChange={(e) => setContactWhatsApp(e.target.value)}
                    placeholder="+56912345678"
                    className={inputClass}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Número completo con código de país, sin espacios
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Título del sitio (meta title)
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Tu Automotora - Vehículos de Calidad"
                    className={inputClass}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Si está vacío, se usará el nombre de tu automotora
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Descripción (meta description)
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Encuentra los mejores vehículos nuevos y usados..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Analytics</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Meta Pixel ID
                  </label>
                  <input
                    type="text"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    placeholder="123456789012345"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
