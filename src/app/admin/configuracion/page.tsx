"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Building2,
  Mail,
  Globe,
  Type,
  AlertCircle,
  CheckCircle,
  Palette,
  Settings,
  Search,
  Home,
  Eye,
  Hash,
} from "lucide-react";
import { SingleImageUpload } from "@/components/ui/SingleImageUpload";

interface SiteConfig {
  id: string;
  siteName: string;
  siteTagline: string | null;
  logo: string | null;
  favicon: string | null;
  headerLogoSize: string;
  footerLogoSize: string;
  showSiteNameInHeader: boolean;
  showSiteNameInFooter: boolean;
  primaryColor: string;
  accentColor: string;
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
  // Home Sections Texts
  whyChooseUsTitle: string;
  whyChooseUsSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  // Why Us Features
  whyUsFeature1Icon: string;
  whyUsFeature1Title: string;
  whyUsFeature1Desc: string;
  whyUsFeature2Icon: string;
  whyUsFeature2Title: string;
  whyUsFeature2Desc: string;
  whyUsFeature3Icon: string;
  whyUsFeature3Title: string;
  whyUsFeature3Desc: string;
  // Home Section Visibility
  showFeaturedVehicles: boolean;
  showRecentVehicles: boolean;
  showPopularBrands: boolean;
  showWhyChooseUs: boolean;
  showCTASection: boolean;
  showTopDealers: boolean;
  // Home Section Limits
  featuredVehiclesLimit: number;
  recentVehiclesLimit: number;
  popularBrandsLimit: number;
  topDealersLimit: number;
  // SEO & Features
  metaDescription: string | null;
  googleAnalyticsId: string | null;
  maxImagesPerVehicle: number;
  showWhatsAppButton: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  updatedAt: string;
}

const LOGO_SIZES = [
  { value: "xs", label: "Extra pequeño", description: "20px" },
  { value: "sm", label: "Pequeño", description: "24px" },
  { value: "md", label: "Mediano", description: "32px" },
  { value: "lg", label: "Grande", description: "40px" },
  { value: "xl", label: "Extra grande", description: "48px" },
  { value: "2xl", label: "2XL", description: "64px" },
  { value: "3xl", label: "3XL", description: "80px" },
  { value: "4xl", label: "4XL", description: "96px" },
  { value: "5xl", label: "5XL", description: "128px" },
  { value: "6xl", label: "6XL", description: "192px" },
  { value: "7xl", label: "7XL", description: "256px" },
];

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
    headerLogoSize: "md",
    footerLogoSize: "md",
    showSiteNameInHeader: true,
    showSiteNameInFooter: true,
    primaryColor: "#2563eb",
    accentColor: "#f97316",
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
    // Home Sections Texts
    whyChooseUsTitle: "¿Por qué elegir AutoExplora.cl?",
    whyChooseUsSubtitle: "Somos el marketplace de vehículos más confiable de Chile",
    ctaTitle: "¿Listo para vender tu vehículo?",
    ctaSubtitle: "Publica tu auto, moto o vehículo comercial en minutos y conecta con compradores interesados.",
    ctaButtonText: "Publicar mi vehículo",
    // Why Us Features
    whyUsFeature1Icon: "Shield",
    whyUsFeature1Title: "Compra segura",
    whyUsFeature1Desc: "Verificamos a los vendedores y te ayudamos en todo el proceso de compra para que sea una experiencia segura.",
    whyUsFeature2Icon: "Zap",
    whyUsFeature2Title: "Vende rápido",
    whyUsFeature2Desc: "Publica tu vehículo en minutos y llega a miles de compradores potenciales en todo Chile.",
    whyUsFeature3Icon: "Users",
    whyUsFeature3Title: "Gran comunidad",
    whyUsFeature3Desc: "Más de 50,000 vehículos disponibles y una comunidad activa de compradores y vendedores.",
    // Home Section Visibility
    showFeaturedVehicles: true,
    showRecentVehicles: true,
    showPopularBrands: true,
    showWhyChooseUs: true,
    showCTASection: true,
    showTopDealers: true,
    // Home Section Limits
    featuredVehiclesLimit: 8,
    recentVehiclesLimit: 8,
    popularBrandsLimit: 12,
    topDealersLimit: 6,
    // SEO & Features
    metaDescription: "",
    googleAnalyticsId: "",
    maxImagesPerVehicle: 10,
    showWhatsAppButton: true,
    maintenanceMode: false,
    maintenanceMessage: "",
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
          headerLogoSize: data.headerLogoSize || "md",
          footerLogoSize: data.footerLogoSize || "md",
          showSiteNameInHeader: data.showSiteNameInHeader ?? true,
          showSiteNameInFooter: data.showSiteNameInFooter ?? true,
          primaryColor: data.primaryColor || "#2563eb",
          accentColor: data.accentColor || "#f97316",
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
          // Home Sections Texts
          whyChooseUsTitle: data.whyChooseUsTitle || "¿Por qué elegir AutoExplora.cl?",
          whyChooseUsSubtitle: data.whyChooseUsSubtitle || "Somos el marketplace de vehículos más confiable de Chile",
          ctaTitle: data.ctaTitle || "¿Listo para vender tu vehículo?",
          ctaSubtitle: data.ctaSubtitle || "Publica tu auto, moto o vehículo comercial en minutos y conecta con compradores interesados.",
          ctaButtonText: data.ctaButtonText || "Publicar mi vehículo",
          // Why Us Features
          whyUsFeature1Icon: data.whyUsFeature1Icon || "Shield",
          whyUsFeature1Title: data.whyUsFeature1Title || "Compra segura",
          whyUsFeature1Desc: data.whyUsFeature1Desc || "Verificamos a los vendedores y te ayudamos en todo el proceso de compra para que sea una experiencia segura.",
          whyUsFeature2Icon: data.whyUsFeature2Icon || "Zap",
          whyUsFeature2Title: data.whyUsFeature2Title || "Vende rápido",
          whyUsFeature2Desc: data.whyUsFeature2Desc || "Publica tu vehículo en minutos y llega a miles de compradores potenciales en todo Chile.",
          whyUsFeature3Icon: data.whyUsFeature3Icon || "Users",
          whyUsFeature3Title: data.whyUsFeature3Title || "Gran comunidad",
          whyUsFeature3Desc: data.whyUsFeature3Desc || "Más de 50,000 vehículos disponibles y una comunidad activa de compradores y vendedores.",
          // Home Section Visibility
          showFeaturedVehicles: data.showFeaturedVehicles ?? true,
          showRecentVehicles: data.showRecentVehicles ?? true,
          showPopularBrands: data.showPopularBrands ?? true,
          showWhyChooseUs: data.showWhyChooseUs ?? true,
          showCTASection: data.showCTASection ?? true,
          showTopDealers: data.showTopDealers ?? true,
          // Home Section Limits
          featuredVehiclesLimit: data.featuredVehiclesLimit || 8,
          recentVehiclesLimit: data.recentVehiclesLimit || 8,
          popularBrandsLimit: data.popularBrandsLimit || 12,
          topDealersLimit: data.topDealersLimit || 6,
          // SEO & Features
          metaDescription: data.metaDescription || "",
          googleAnalyticsId: data.googleAnalyticsId || "",
          maxImagesPerVehicle: data.maxImagesPerVehicle || 10,
          showWhatsAppButton: data.showWhatsAppButton ?? true,
          maintenanceMode: data.maintenanceMode ?? false,
          maintenanceMessage: data.maintenanceMessage || "",
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

  const handleChange = (field: keyof typeof formData, value: string | boolean | number) => {
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
            Personaliza la identidad, apariencia y funcionalidad del sitio
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
                  placeholder="AutoExplora.cl"
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
                  Logo del sitio
                </label>
                <SingleImageUpload
                  value={formData.logo}
                  onChange={(url) => handleChange("logo", url)}
                  onRemove={() => handleChange("logo", "")}
                  folder="site"
                  aspectRatio="square"
                  placeholder="Logo (400×400px recomendado)"
                  disabled={saving}
                  className="max-w-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Favicon
                </label>
                <SingleImageUpload
                  value={formData.favicon}
                  onChange={(url) => handleChange("favicon", url)}
                  onRemove={() => handleChange("favicon", "")}
                  folder="site"
                  aspectRatio="square"
                  placeholder="Favicon (32×32px recomendado)"
                  disabled={saving}
                  className="max-w-[120px]"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Icono que aparece en la pestaña del navegador
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Apariencia del Logo */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Palette className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Apariencia del Logo</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tamaño del logo en Header
                </label>
                <select
                  value={formData.headerLogoSize}
                  onChange={(e) => handleChange("headerLogoSize", e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                >
                  {LOGO_SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label} ({size.description})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tamaño del logo en Footer
                </label>
                <select
                  value={formData.footerLogoSize}
                  onChange={(e) => handleChange("footerLogoSize", e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                >
                  {LOGO_SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label} ({size.description})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showSiteNameInHeader}
                  onChange={(e) => handleChange("showSiteNameInHeader", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">
                    Mostrar nombre en Header
                  </span>
                  <p className="text-xs text-neutral-500">
                    Muestra el nombre del sitio junto al logo
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showSiteNameInFooter}
                  onChange={(e) => handleChange("showSiteNameInFooter", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">
                    Mostrar nombre en Footer
                  </span>
                  <p className="text-xs text-neutral-500">
                    Muestra el nombre del sitio junto al logo
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Color primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-12 h-10 rounded border border-neutral-300 cursor-pointer"
                    disabled={saving}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={saving}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Color de acento
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-12 h-10 rounded border border-neutral-300 cursor-pointer"
                    disabled={saving}
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    placeholder="#f97316"
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={saving}
                  />
                </div>
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
                  placeholder="contacto@autoexplora.cl"
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
                  placeholder="https://facebook.com/autoexplora"
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
                  placeholder="https://instagram.com/autoexplora"
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
                  placeholder="https://twitter.com/autoexplora"
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
                  placeholder="https://youtube.com/@autoexplora"
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
                placeholder="© 2024 AutoExplora.cl. Todos los derechos reservados."
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500 resize-none"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Textos del Home */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Home className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Textos del Home</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="border-b border-neutral-100 pb-6">
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">Sección &quot;¿Por qué elegirnos?&quot;</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.whyChooseUsTitle}
                    onChange={(e) => handleChange("whyChooseUsTitle", e.target.value)}
                    placeholder="¿Por qué elegir AutoExplora.cl?"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.whyChooseUsSubtitle}
                    onChange={(e) => handleChange("whyChooseUsSubtitle", e.target.value)}
                    placeholder="Somos el marketplace de vehículos más confiable de Chile"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={saving}
                  />
                </div>

                {/* Feature 1 */}
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Característica 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Icono</label>
                      <select
                        value={formData.whyUsFeature1Icon}
                        onChange={(e) => handleChange("whyUsFeature1Icon", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
                        disabled={saving}
                      >
                        <option value="Shield">Escudo (Seguridad)</option>
                        <option value="Zap">Rayo (Rapidez)</option>
                        <option value="Users">Usuarios (Comunidad)</option>
                        <option value="Star">Estrella (Calidad)</option>
                        <option value="Heart">Corazón (Confianza)</option>
                        <option value="ThumbsUp">Pulgar arriba (Aprobación)</option>
                        <option value="Award">Premio (Excelencia)</option>
                        <option value="CheckCircle">Check (Verificado)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-neutral-500 mb-1">Título</label>
                      <input
                        type="text"
                        value={formData.whyUsFeature1Title}
                        onChange={(e) => handleChange("whyUsFeature1Title", e.target.value)}
                        placeholder="Compra segura"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-neutral-500 mb-1">Descripción</label>
                    <textarea
                      value={formData.whyUsFeature1Desc}
                      onChange={(e) => handleChange("whyUsFeature1Desc", e.target.value)}
                      placeholder="Descripción de la característica..."
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Característica 2</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Icono</label>
                      <select
                        value={formData.whyUsFeature2Icon}
                        onChange={(e) => handleChange("whyUsFeature2Icon", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
                        disabled={saving}
                      >
                        <option value="Shield">Escudo (Seguridad)</option>
                        <option value="Zap">Rayo (Rapidez)</option>
                        <option value="Users">Usuarios (Comunidad)</option>
                        <option value="Star">Estrella (Calidad)</option>
                        <option value="Heart">Corazón (Confianza)</option>
                        <option value="ThumbsUp">Pulgar arriba (Aprobación)</option>
                        <option value="Award">Premio (Excelencia)</option>
                        <option value="CheckCircle">Check (Verificado)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-neutral-500 mb-1">Título</label>
                      <input
                        type="text"
                        value={formData.whyUsFeature2Title}
                        onChange={(e) => handleChange("whyUsFeature2Title", e.target.value)}
                        placeholder="Vende rápido"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-neutral-500 mb-1">Descripción</label>
                    <textarea
                      value={formData.whyUsFeature2Desc}
                      onChange={(e) => handleChange("whyUsFeature2Desc", e.target.value)}
                      placeholder="Descripción de la característica..."
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Característica 3</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Icono</label>
                      <select
                        value={formData.whyUsFeature3Icon}
                        onChange={(e) => handleChange("whyUsFeature3Icon", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
                        disabled={saving}
                      >
                        <option value="Shield">Escudo (Seguridad)</option>
                        <option value="Zap">Rayo (Rapidez)</option>
                        <option value="Users">Usuarios (Comunidad)</option>
                        <option value="Star">Estrella (Calidad)</option>
                        <option value="Heart">Corazón (Confianza)</option>
                        <option value="ThumbsUp">Pulgar arriba (Aprobación)</option>
                        <option value="Award">Premio (Excelencia)</option>
                        <option value="CheckCircle">Check (Verificado)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-neutral-500 mb-1">Título</label>
                      <input
                        type="text"
                        value={formData.whyUsFeature3Title}
                        onChange={(e) => handleChange("whyUsFeature3Title", e.target.value)}
                        placeholder="Gran comunidad"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-neutral-500 mb-1">Descripción</label>
                    <textarea
                      value={formData.whyUsFeature3Desc}
                      onChange={(e) => handleChange("whyUsFeature3Desc", e.target.value)}
                      placeholder="Descripción de la característica..."
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">Sección CTA (Llamada a la Acción)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Título del CTA
                  </label>
                  <input
                    type="text"
                    value={formData.ctaTitle}
                    onChange={(e) => handleChange("ctaTitle", e.target.value)}
                    placeholder="¿Listo para vender tu vehículo?"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subtítulo del CTA
                  </label>
                  <textarea
                    value={formData.ctaSubtitle}
                    onChange={(e) => handleChange("ctaSubtitle", e.target.value)}
                    placeholder="Publica tu auto, moto o vehículo comercial en minutos..."
                    rows={2}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500 resize-none"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Texto del Botón
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonText}
                    onChange={(e) => handleChange("ctaButtonText", e.target.value)}
                    placeholder="Publicar mi vehículo"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visibilidad de Secciones del Home */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Eye className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Visibilidad de Secciones del Home</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-neutral-500 mb-4">
              Activa o desactiva las secciones que se muestran en la página principal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.showFeaturedVehicles}
                  onChange={(e) => handleChange("showFeaturedVehicles", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">Vehículos Destacados</span>
                  <p className="text-xs text-neutral-500">Muestra los vehículos marcados como destacados</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.showRecentVehicles}
                  onChange={(e) => handleChange("showRecentVehicles", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">Vehículos Recientes</span>
                  <p className="text-xs text-neutral-500">Muestra los últimos vehículos publicados</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.showPopularBrands}
                  onChange={(e) => handleChange("showPopularBrands", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">Marcas Populares</span>
                  <p className="text-xs text-neutral-500">Muestra las marcas con más vehículos</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.showTopDealers}
                  onChange={(e) => handleChange("showTopDealers", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">Dealers Destacados</span>
                  <p className="text-xs text-neutral-500">Muestra los dealers con más vehículos</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.showWhyChooseUs}
                  onChange={(e) => handleChange("showWhyChooseUs", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">¿Por qué elegirnos?</span>
                  <p className="text-xs text-neutral-500">Sección de beneficios del sitio</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.showCTASection}
                  onChange={(e) => handleChange("showCTASection", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">Llamada a la Acción (CTA)</span>
                  <p className="text-xs text-neutral-500">Sección para publicar vehículos</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Límites de Items del Home */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Hash className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Límites de Items del Home</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-neutral-500 mb-4">
              Define cuántos elementos se mostrarán en cada sección de la página principal.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vehículos Destacados
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.featuredVehiclesLimit}
                  onChange={(e) => handleChange("featuredVehiclesLimit", parseInt(e.target.value) || 8)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                <p className="text-xs text-neutral-500 mt-1">Cantidad de vehículos destacados a mostrar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vehículos Recientes
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.recentVehiclesLimit}
                  onChange={(e) => handleChange("recentVehiclesLimit", parseInt(e.target.value) || 8)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                <p className="text-xs text-neutral-500 mt-1">Cantidad de vehículos recientes a mostrar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Marcas Populares
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.popularBrandsLimit}
                  onChange={(e) => handleChange("popularBrandsLimit", parseInt(e.target.value) || 12)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                <p className="text-xs text-neutral-500 mt-1">Cantidad de marcas a mostrar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dealers Destacados
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={formData.topDealersLimit}
                  onChange={(e) => handleChange("topDealersLimit", parseInt(e.target.value) || 6)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                <p className="text-xs text-neutral-500 mt-1">Cantidad de dealers a mostrar</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO y Analytics */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">SEO y Analytics</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Meta descripción por defecto
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleChange("metaDescription", e.target.value)}
                placeholder="Descripción que aparece en los resultados de búsqueda de Google..."
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500 resize-none"
                disabled={saving}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Recomendado: 150-160 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={formData.googleAnalyticsId}
                onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                disabled={saving}
              />
              <p className="text-xs text-neutral-500 mt-1">
                ID de medición de Google Analytics 4
              </p>
            </div>
          </div>
        </div>

        {/* Opciones de Funcionalidad */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Settings className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900">Opciones de Funcionalidad</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Máximo de imágenes por vehículo
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.maxImagesPerVehicle}
                  onChange={(e) => handleChange("maxImagesPerVehicle", parseInt(e.target.value) || 10)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showWhatsAppButton}
                    onChange={(e) => handleChange("showWhatsAppButton", e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
                    disabled={saving}
                  />
                  <div>
                    <span className="text-sm font-medium text-neutral-700">
                      Mostrar botón de WhatsApp
                    </span>
                    <p className="text-xs text-neutral-500">
                      Muestra botón de contacto por WhatsApp en vehículos
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-red-700">
                    Modo mantenimiento
                  </span>
                  <p className="text-xs text-neutral-500">
                    Muestra una página de mantenimiento a los usuarios
                  </p>
                </div>
              </label>

              {formData.maintenanceMode && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Mensaje de mantenimiento
                  </label>
                  <textarea
                    value={formData.maintenanceMessage}
                    onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
                    placeholder="Estamos realizando mejoras en el sitio. Volvemos pronto..."
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500 resize-none"
                    disabled={saving}
                  />
                </div>
              )}
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
