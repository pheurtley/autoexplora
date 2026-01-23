"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  Plus,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";

interface DealerDomain {
  id: string;
  domain: string;
  isCustom: boolean;
  isPrimary: boolean;
  status: string;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
}

interface DealerPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  showInNav: boolean;
  order: number;
}

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
  domains: DealerDomain[];
  pages: DealerPage[];
}

interface DealerInfo {
  id: string;
  tradeName: string;
  slug: string;
}

type Tab = "general" | "branding" | "contact" | "analytics" | "pages" | "domains";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "branding", label: "Apariencia", icon: Palette },
  { id: "contact", label: "Contacto", icon: Phone },
  { id: "analytics", label: "SEO & Analytics", icon: BarChart3 },
  { id: "pages", label: "Páginas", icon: FileText },
  { id: "domains", label: "Dominios", icon: Globe },
];

export default function AdminDealerMicrositePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dealerId } = use(params);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Config form state
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

  // Pages state
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageCreating, setPageCreating] = useState(false);

  // Domains state
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domainAdding, setDomainAdding] = useState(false);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);

  const apiBase = `/api/admin/dealers/${dealerId}/microsite`;

  useEffect(() => {
    fetchConfig();
  }, [dealerId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(apiBase);
      if (res.ok) {
        const data = await res.json();
        const c = data.config;
        setConfig(c);
        setDealer(data.dealer);
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
    } catch (error) {
      console.error("Error fetching config:", error);
      setErrorMessage("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch(apiBase, {
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

      const data = await res.json();
      setConfig(data.config);
      setSuccessMessage("Cambios guardados correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePage = async () => {
    if (!pageTitle || !pageSlug) return;
    setPageCreating(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${apiBase}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pageTitle, slug: pageSlug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear página");
      }

      setPageTitle("");
      setPageSlug("");
      setShowPageForm(false);
      fetchConfig();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al crear página");
    } finally {
      setPageCreating(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("¿Eliminar esta página?")) return;

    try {
      const res = await fetch(`${apiBase}/pages/${pageId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar página");
      }
      fetchConfig();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleTogglePagePublish = async (page: DealerPage) => {
    try {
      const res = await fetch(`${apiBase}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      });
      if (res.ok) fetchConfig();
    } catch (err) {
      console.error("Error toggling page:", err);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain) return;
    setDomainAdding(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${apiBase}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar dominio");
      }

      setNewDomain("");
      setShowDomainForm(false);
      fetchConfig();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al agregar dominio");
    } finally {
      setDomainAdding(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("¿Eliminar este dominio?")) return;

    try {
      const res = await fetch(`${apiBase}/domains/${domainId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar dominio");
      }
      fetchConfig();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al eliminar dominio");
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomainId(domainId);
    setErrorMessage("");

    try {
      const res = await fetch(`${apiBase}/domains/${domainId}/verify`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al verificar");
      }

      if (data.verified) {
        setSuccessMessage("Dominio verificado correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "No se pudo verificar el dominio");
      }

      fetchConfig();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al verificar");
    } finally {
      setVerifyingDomainId(null);
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

  const dealerSubdomain = dealer?.slug || dealerId;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/automotoras/${dealerId}`}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Micrositio: {dealer?.tradeName}
            </h1>
            <p className="text-neutral-600 text-sm mt-0.5">
              Configuración del micrositio de la automotora
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
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
          <button onClick={() => setErrorMessage("")} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
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
                  ? "El sitio es visible para el público"
                  : "El sitio no es visible aún"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isActive && (
              <a
                href={`https://${dealerSubdomain}.autoexplora.cl`}
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
              <h3 className="font-semibold text-neutral-900 mb-4">Sección Hero</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Título principal
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Bienvenido a [Automotora]"
                    className={inputClass}
                  />
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
              <h3 className="font-semibold text-neutral-900 mb-4">Vehículos Destacados</h3>
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
                      onChange={(e) => setFeaturedVehiclesLimit(parseInt(e.target.value))}
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

            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Vista previa</h3>
              <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="p-6 text-center" style={{ backgroundColor: primaryColor }}>
                  <p className="text-white font-bold text-lg">
                    {heroTitle || dealer?.tradeName || "Automotora"}
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

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showWhatsAppButton}
                onChange={(e) => setShowWhatsAppButton(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
              />
              <span className="text-sm text-neutral-700">
                Mostrar botón flotante de WhatsApp
              </span>
            </label>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4">Información de Contacto</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Esta información se mostrará en el micrositio del dealer.
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
                    placeholder="contacto@automotora.cl"
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
                    placeholder="Automotora - Vehículos de Calidad"
                    className={inputClass}
                  />
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

        {activeTab === "pages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Páginas Personalizadas</h3>
              <Button
                onClick={() => setShowPageForm(!showPageForm)}
                size="sm"
                variant={showPageForm ? "outline" : "primary"}
              >
                {showPageForm ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Nueva Página
                  </>
                )}
              </Button>
            </div>

            {showPageForm && (
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => {
                        setPageTitle(e.target.value);
                        setPageSlug(
                          e.target.value
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }}
                      placeholder="Nosotros"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      placeholder="nosotros"
                      className={inputClass}
                    />
                  </div>
                </div>
                <Button onClick={handleCreatePage} disabled={pageCreating || !pageTitle || !pageSlug} size="sm">
                  {pageCreating ? "Creando..." : "Crear Página"}
                </Button>
              </div>
            )}

            {config?.pages && config.pages.length > 0 ? (
              <div className="space-y-2">
                {config.pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{page.title}</p>
                        <p className="text-xs text-neutral-500">/{page.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePagePublish(page)}
                        className={`text-xs px-2 py-1 rounded ${
                          page.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {page.isPublished ? "Publicada" : "Borrador"}
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-8">
                No hay páginas personalizadas aún.
              </p>
            )}
          </div>
        )}

        {activeTab === "domains" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900">Dominios Personalizados</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Subdominio por defecto:{" "}
                  <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">
                    {dealerSubdomain}.autoexplora.cl
                  </code>
                </p>
              </div>
              <Button
                onClick={() => setShowDomainForm(!showDomainForm)}
                size="sm"
                variant={showDomainForm ? "outline" : "primary"}
              >
                {showDomainForm ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Agregar Dominio
                  </>
                )}
              </Button>
            </div>

            {showDomainForm && (
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Dominio
                  </label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="www.miautomotora.cl"
                    className={inputClass}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    El dominio debe tener un registro CNAME apuntando a autoexplora.cl
                  </p>
                </div>
                <Button onClick={handleAddDomain} disabled={domainAdding || !newDomain} size="sm">
                  {domainAdding ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            )}

            {config?.domains && config.domains.length > 0 ? (
              <div className="space-y-2">
                {config.domains.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900 text-sm">{d.domain}</p>
                        <p className="text-xs text-neutral-500">
                          {d.status === "VERIFIED" && "Verificado"}
                          {d.status === "PENDING" && "Pendiente de verificación"}
                          {d.status === "FAILED" && "Verificación fallida"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          d.status === "VERIFIED"
                            ? "bg-green-100 text-green-700"
                            : d.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {d.status === "VERIFIED" ? "OK" : d.status === "FAILED" ? "Error" : "Pendiente"}
                      </span>
                      {d.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleVerifyDomain(d.id)}
                          disabled={verifyingDomainId === d.id}
                          className="p-1 text-neutral-400 hover:text-andino-600 transition-colors disabled:opacity-50"
                          title="Verificar DNS"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${verifyingDomainId === d.id ? "animate-spin" : ""}`}
                          />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDomain(d.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-8">
                No hay dominios personalizados configurados.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
