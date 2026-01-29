import Link from "next/link";
import prisma from "@/lib/prisma";
import { StatsCard } from "@/components/admin";
import { SITE_URL } from "@/lib/constants";
import {
  Globe,
  FileText,
  Rss,
  MapPin,
  Tag,
  Building2,
  Car,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Image as ImageIcon,
  DollarSign,
  FileSearch,
  Shield,
  Code,
  ClipboardCheck,
  HelpCircle,
} from "lucide-react";
import { FaqTemplateManager } from "@/components/admin";

async function getSeoStats() {
  const [
    // Vehicle stats
    totalVehicles,
    activeVehicles,
    vehiclesWithImages,
    vehiclesWithDescription,
    vehiclesWithPrice,
    vehiclesEligibleForFeed,
    // Brand/Model stats
    totalBrands,
    totalModels,
    // Region stats
    totalRegions,
    // Dealer stats
    totalDealers,
    dealersWithLogo,
    dealersWithBanner,
    dealersWithDescription,
    dealersWithSchedule,
    // Top brands by vehicle count
    topBrands,
    // Top regions by vehicle count
    topRegions,
  ] = await Promise.all([
    // Vehicles
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    prisma.vehicle.count({
      where: { status: "ACTIVE", images: { some: {} } },
    }),
    prisma.vehicle.count({
      where: { status: "ACTIVE", description: { not: null } },
    }),
    prisma.vehicle.count({
      where: { status: "ACTIVE", price: { gt: 0 } },
    }),
    prisma.vehicle.count({
      where: {
        status: "ACTIVE",
        price: { gt: 0 },
        images: { some: {} },
      },
    }),
    // Brands/Models
    prisma.brand.count(),
    prisma.model.count(),
    // Regions
    prisma.region.count(),
    // Dealers
    prisma.dealer.count({ where: { status: "ACTIVE" } }),
    prisma.dealer.count({
      where: { status: "ACTIVE", logo: { not: null } },
    }),
    prisma.dealer.count({
      where: { status: "ACTIVE", banner: { not: null } },
    }),
    prisma.dealer.count({
      where: { status: "ACTIVE", description: { not: null } },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "Dealer"
      WHERE status = 'ACTIVE' AND schedule IS NOT NULL
    `.then((result) => Number(result[0].count)),
    // Top brands
    prisma.brand.findMany({
      take: 10,
      orderBy: {
        vehicles: { _count: "desc" },
      },
      select: {
        name: true,
        slug: true,
        _count: { select: { vehicles: { where: { status: "ACTIVE" } } } },
      },
    }),
    // Top regions
    prisma.region.findMany({
      take: 10,
      orderBy: {
        vehicles: { _count: "desc" },
      },
      select: {
        name: true,
        slug: true,
        _count: { select: { vehicles: { where: { status: "ACTIVE" } } } },
      },
    }),
  ]);

  // Calculate sitemap page counts
  const sitemapPages = {
    static: 3, // Home, /vehiculos, /automotoras
    vehicles: activeVehicles,
    brands: totalBrands,
    brandModels: totalModels,
    regions: totalRegions,
    dealers: totalDealers,
    total: 3 + activeVehicles + totalBrands + totalModels + totalRegions + totalDealers,
  };

  // Calculate SEO health percentages
  const vehicleSeoHealth = {
    withImages: activeVehicles > 0 ? Math.round((vehiclesWithImages / activeVehicles) * 100) : 0,
    withDescription: activeVehicles > 0 ? Math.round((vehiclesWithDescription / activeVehicles) * 100) : 0,
    withPrice: activeVehicles > 0 ? Math.round((vehiclesWithPrice / activeVehicles) * 100) : 0,
    feedEligible: activeVehicles > 0 ? Math.round((vehiclesEligibleForFeed / activeVehicles) * 100) : 0,
  };

  const dealerSeoHealth = {
    withLogo: totalDealers > 0 ? Math.round((dealersWithLogo / totalDealers) * 100) : 0,
    withBanner: totalDealers > 0 ? Math.round((dealersWithBanner / totalDealers) * 100) : 0,
    withDescription: totalDealers > 0 ? Math.round((dealersWithDescription / totalDealers) * 100) : 0,
    withSchedule: totalDealers > 0 ? Math.round((dealersWithSchedule / totalDealers) * 100) : 0,
  };

  return {
    sitemapPages,
    vehiclesEligibleForFeed,
    activeVehicles,
    totalDealers,
    totalBrands,
    totalModels,
    totalRegions,
    vehicleSeoHealth,
    dealerSeoHealth,
    topBrands: topBrands.filter((b) => b._count.vehicles > 0),
    topRegions: topRegions.filter((r) => r._count.vehicles > 0),
  };
}

function ProgressBar({ value, color = "andino" }: { value: number; color?: string }) {
  const colorClasses = {
    andino: "bg-andino-600",
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className="w-full bg-neutral-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.andino}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function getHealthColor(value: number): string {
  if (value >= 90) return "green";
  if (value >= 70) return "amber";
  return "red";
}

// ==================== SEO Checklist ====================

const SEO_CHECKLIST = [
  {
    category: "Archivos SEO",
    items: [
      "sitemap.xml dinámico",
      "robots.txt configurado",
      "Canonical URLs",
      "Meta tags dinámicos",
      "Favicon personalizable",
    ],
  },
  {
    category: "Schemas JSON-LD",
    items: [
      "Organization",
      "WebSite + SearchAction",
      "Vehicle (Product)",
      "BreadcrumbList",
      "FAQPage",
      "LocalBusiness",
    ],
  },
  {
    category: "Tags y Atributos",
    items: [
      "Alt tags en imágenes",
      "Open Graph tags",
      "noindex en páginas protegidas",
      "Security headers",
      "Breadcrumbs visibles",
    ],
  },
];

function SeoChecklist() {
  const totalItems = SEO_CHECKLIST.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-neutral-500" />
          SEO Checklist
        </h2>
        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
          {totalItems}/{totalItems} implementados
        </span>
      </div>
      <div className="mb-4">
        <ProgressBar value={100} color="green" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SEO_CHECKLIST.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">{group.category}</h3>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Schema Coverage Panel ====================

const SCHEMA_COVERAGE = [
  {
    name: "Organization",
    pages: ["Home"],
    description: "Información de la empresa, logo, redes sociales",
  },
  {
    name: "WebSite",
    pages: ["Home"],
    description: "SearchAction para sitelinks de Google",
  },
  {
    name: "Vehicle (Product)",
    pages: ["Detalle vehículo"],
    description: "Nombre, precio, imagen, marca, modelo, condición",
  },
  {
    name: "BreadcrumbList",
    pages: ["Marca", "Modelo", "Región", "Detalle"],
    description: "Navegación jerárquica para Google",
  },
  {
    name: "FAQPage",
    pages: ["Marca", "Modelo", "Región"],
    description: "Preguntas frecuentes por tipo de página",
  },
  {
    name: "LocalBusiness",
    pages: ["Automotora"],
    description: "Datos de negocio local, dirección, horarios",
  },
];

function SchemaCoveragePanel() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Code className="h-5 w-5 text-neutral-500" />
        Cobertura de Schemas JSON-LD
      </h2>
      <div className="space-y-3">
        {SCHEMA_COVERAGE.map((schema) => (
          <div
            key={schema.name}
            className="flex items-start justify-between py-2 border-b border-neutral-100 last:border-0"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-neutral-900 text-sm">{schema.name}</span>
                <div className="flex gap-1">
                  {schema.pages.map((page) => (
                    <span
                      key={page}
                      className="text-xs px-2 py-0.5 bg-andino-50 text-andino-700 rounded-full"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-neutral-500">{schema.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Security Headers Panel ====================

const SECURITY_HEADERS = [
  { name: "X-Content-Type-Options", value: "nosniff" },
  { name: "X-Frame-Options", value: "DENY" },
  { name: "X-XSS-Protection", value: "1; mode=block" },
  { name: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { name: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

function SecurityHeadersPanel() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-neutral-500" />
        Security Headers
      </h2>
      <div className="space-y-3">
        {SECURITY_HEADERS.map((header) => (
          <div
            key={header.name}
            className="flex items-start gap-2 py-2 border-b border-neutral-100 last:border-0"
          >
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <code className="text-sm font-mono text-neutral-900">{header.name}</code>
              <p className="text-xs text-neutral-500 mt-0.5 break-all">{header.value}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-4">
        Configurados en <code className="bg-neutral-100 px-1 rounded">next.config.ts</code>
      </p>
    </div>
  );
}

export default async function SeoAdminPage() {
  const stats = await getSeoStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">SEO & Feeds</h1>
        <p className="text-neutral-600 mt-1">
          Monitoreo de SEO, sitemap y feeds de Google Merchant Center
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Páginas en Sitemap"
          value={stats.sitemapPages.total.toLocaleString("es-CL")}
          subtitle="URLs indexables"
          icon={FileText}
        />
        <StatsCard
          title="Feed Merchant Center"
          value={stats.vehiclesEligibleForFeed.toLocaleString("es-CL")}
          subtitle={`de ${stats.activeVehicles} vehículos activos`}
          icon={Rss}
          variant={stats.vehicleSeoHealth.feedEligible >= 90 ? "success" : "warning"}
        />
        <StatsCard
          title="URLs por Marca"
          value={stats.totalBrands + stats.totalModels}
          subtitle={`${stats.totalBrands} marcas, ${stats.totalModels} modelos`}
          icon={Tag}
        />
        <StatsCard
          title="URLs por Región"
          value={stats.totalRegions}
          subtitle="regiones con página dedicada"
          icon={MapPin}
        />
      </div>

      {/* SEO Checklist */}
      <SeoChecklist />

      {/* Feed URLs */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-neutral-500" />
          URLs de Feeds y Sitemap
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="font-medium text-neutral-900">Sitemap XML</p>
                <p className="text-sm text-neutral-500">{SITE_URL}/sitemap.xml</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${SITE_URL}/sitemap.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
                title="Abrir sitemap"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Rss className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-neutral-900">Google Merchant Center Feed</p>
                <p className="text-sm text-neutral-500">{SITE_URL}/api/feeds/google-merchant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${SITE_URL}/api/feeds/google-merchant`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
                title="Abrir feed"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSearch className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="font-medium text-neutral-900">robots.txt</p>
                <p className="text-sm text-neutral-500">{SITE_URL}/robots.txt</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${SITE_URL}/robots.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
                title="Abrir robots.txt"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sitemap Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-neutral-500" />
            Desglose del Sitemap
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Páginas estáticas</span>
              <span className="font-semibold text-neutral-900">{stats.sitemapPages.static}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Vehículos (/vehiculos/[slug])</span>
              <span className="font-semibold text-neutral-900">{stats.sitemapPages.vehicles.toLocaleString("es-CL")}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Marcas (/vehiculos/marca/[slug])</span>
              <span className="font-semibold text-neutral-900">{stats.sitemapPages.brands}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Marca+Modelo (/vehiculos/marca/.../...)</span>
              <span className="font-semibold text-neutral-900">{stats.sitemapPages.brandModels}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Regiones (/vehiculos/region/[slug])</span>
              <span className="font-semibold text-neutral-900">{stats.sitemapPages.regions}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Automotoras (/automotora/[slug])</span>
              <span className="font-semibold text-neutral-900">{stats.sitemapPages.dealers}</span>
            </div>
            <div className="flex items-center justify-between py-2 pt-3 border-t-2 border-neutral-200">
              <span className="font-semibold text-neutral-900">Total URLs</span>
              <span className="font-bold text-andino-600 text-lg">{stats.sitemapPages.total.toLocaleString("es-CL")}</span>
            </div>
          </div>
        </div>

        {/* Vehicle SEO Health */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-neutral-500" />
            Salud SEO - Vehículos
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Con imágenes
                </span>
                <span className="text-sm font-semibold">{stats.vehicleSeoHealth.withImages}%</span>
              </div>
              <ProgressBar value={stats.vehicleSeoHealth.withImages} color={getHealthColor(stats.vehicleSeoHealth.withImages)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Con descripción
                </span>
                <span className="text-sm font-semibold">{stats.vehicleSeoHealth.withDescription}%</span>
              </div>
              <ProgressBar value={stats.vehicleSeoHealth.withDescription} color={getHealthColor(stats.vehicleSeoHealth.withDescription)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Con precio válido
                </span>
                <span className="text-sm font-semibold">{stats.vehicleSeoHealth.withPrice}%</span>
              </div>
              <ProgressBar value={stats.vehicleSeoHealth.withPrice} color={getHealthColor(stats.vehicleSeoHealth.withPrice)} />
            </div>
            <div className="pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <Rss className="h-4 w-4" />
                  Elegibles para Feed
                </span>
                <span className="text-sm font-bold text-andino-600">{stats.vehicleSeoHealth.feedEligible}%</span>
              </div>
              <ProgressBar value={stats.vehicleSeoHealth.feedEligible} color="andino" />
              <p className="text-xs text-neutral-500 mt-1">
                Requiere: imagen + precio &gt; 0
              </p>
            </div>
          </div>
        </div>

        {/* Dealer SEO Health */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-neutral-500" />
            Salud SEO - Automotoras
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600">Con logo</span>
                <span className="text-sm font-semibold">{stats.dealerSeoHealth.withLogo}%</span>
              </div>
              <ProgressBar value={stats.dealerSeoHealth.withLogo} color={getHealthColor(stats.dealerSeoHealth.withLogo)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600">Con banner</span>
                <span className="text-sm font-semibold">{stats.dealerSeoHealth.withBanner}%</span>
              </div>
              <ProgressBar value={stats.dealerSeoHealth.withBanner} color={getHealthColor(stats.dealerSeoHealth.withBanner)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600">Con descripción</span>
                <span className="text-sm font-semibold">{stats.dealerSeoHealth.withDescription}%</span>
              </div>
              <ProgressBar value={stats.dealerSeoHealth.withDescription} color={getHealthColor(stats.dealerSeoHealth.withDescription)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-600">Con horarios</span>
                <span className="text-sm font-semibold">{stats.dealerSeoHealth.withSchedule}%</span>
              </div>
              <ProgressBar value={stats.dealerSeoHealth.withSchedule} color={getHealthColor(stats.dealerSeoHealth.withSchedule)} />
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            Mejora el JSON-LD LocalBusiness para mejor SEO local
          </p>
        </div>

        {/* URL Structure Examples */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-neutral-500" />
            Estructura de URLs SEO
          </h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-800 mb-1">URLs Amigables (Implementadas)</p>
              <code className="text-green-700 text-xs block">/vehiculos/marca/toyota</code>
              <code className="text-green-700 text-xs block">/vehiculos/marca/toyota/corolla</code>
              <code className="text-green-700 text-xs block">/vehiculos/region/metropolitana</code>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-medium text-amber-800 mb-1">Redirects Automáticos</p>
              <code className="text-amber-700 text-xs block">/vehiculos?brandId=xxx → /vehiculos/marca/[slug]</code>
              <code className="text-amber-700 text-xs block">/vehiculos?regionId=xxx → /vehiculos/region/[slug]</code>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-800 mb-1">Canonical URLs</p>
              <p className="text-blue-700 text-xs">
                Los filtros de búsqueda incluyen canonical URL normalizada para evitar contenido duplicado
              </p>
            </div>
          </div>
        </div>

        {/* Schema Coverage Panel */}
        <SchemaCoveragePanel />

        {/* Security Headers Status */}
        <SecurityHeadersPanel />
      </div>

      {/* Top Brands and Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Brands */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-neutral-500" />
            Top Marcas (URLs con más tráfico potencial)
          </h2>
          <div className="space-y-2">
            {stats.topBrands.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4 text-center">
                No hay marcas con vehículos activos
              </p>
            ) : (
              stats.topBrands.map((brand, index) => (
                <div
                  key={brand.slug}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-sm w-5">{index + 1}.</span>
                    <Link
                      href={`/vehiculos/marca/${brand.slug}`}
                      className="font-medium text-neutral-900 hover:text-andino-600"
                    >
                      {brand.name}
                    </Link>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {brand._count.vehicles} vehículos
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Regions */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-neutral-500" />
            Top Regiones (URLs con más tráfico potencial)
          </h2>
          <div className="space-y-2">
            {stats.topRegions.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4 text-center">
                No hay regiones con vehículos activos
              </p>
            ) : (
              stats.topRegions.map((region, index) => (
                <div
                  key={region.slug}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-sm w-5">{index + 1}.</span>
                    <Link
                      href={`/vehiculos/region/${region.slug}`}
                      className="font-medium text-neutral-900 hover:text-andino-600"
                    >
                      {region.name}
                    </Link>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {region._count.vehicles} vehículos
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FAQ Template Manager */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-neutral-500" />
          Plantillas FAQ por Tipo de Página
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Configura las preguntas frecuentes que se muestran en las páginas de marca, modelo y región para mejorar el SEO con FAQ Schema.
        </p>
        <FaqTemplateManager />
      </div>

      {/* Google Merchant Center Instructions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Rss className="h-5 w-5 text-amber-500" />
          Configuración Google Merchant Center
        </h2>
        <div className="prose prose-sm max-w-none text-neutral-600">
          <p>Para conectar el feed con Google Merchant Center:</p>
          <ol className="list-decimal list-inside space-y-2 mt-3">
            <li>Crear cuenta en <strong>merchants.google.com</strong></li>
            <li>Verificar el dominio autoexplora.cl</li>
            <li>
              Agregar feed con URL:{" "}
              <code className="bg-neutral-100 px-2 py-0.5 rounded text-sm">
                {SITE_URL}/api/feeds/google-merchant
              </code>
            </li>
            <li>Configurar actualización automática (cada 1 hora recomendado)</li>
            <li>Vincular con Google Ads para Vehicle Ads</li>
          </ol>
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Nota:</strong> El feed incluye solo vehículos activos con imagen y precio válido.
              Actualmente hay <strong>{stats.vehiclesEligibleForFeed}</strong> vehículos elegibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
