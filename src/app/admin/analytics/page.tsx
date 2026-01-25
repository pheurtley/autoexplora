"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Phone,
  MessageCircle,
  Mail,
  Heart,
  Share2,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  Building2,
  Car,
  Download,
  ArrowUpRight,
} from "lucide-react";

interface AnalyticsData {
  period: number;
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalContacts: number;
    totalLeads: number;
    totalSearches: number;
    totalFavorites: number;
    totalShares: number;
    comparison: {
      pageViewsChange: number;
      visitorsChange: number;
      contactsChange: number;
      leadsChange: number;
    };
  };
  byDevice: Record<string, number>;
  bySource: Record<string, number>;
  byContactType: Record<string, number>;
  byDay: Array<{ date: string; views: number; contacts: number; visitors: number }>;
  funnel: Array<{ stage: string; count: number; percentage: number }>;
  topDealers: Array<{ id: string; tradeName: string; slug: string | null; contacts: number }>;
  topVehicles: Array<{ id: string; title: string; slug: string | null; brand: string; model: string; views: number }>;
}

const periods = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-andino-600",
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">
            {typeof value === "number" ? value.toLocaleString("es-CL") : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{change >= 0 ? "+" : ""}{change}% vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-neutral-100 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function FunnelChart({ data }: { data: Array<{ stage: string; count: number; percentage: number }> }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {data.map((stage, index) => (
        <div key={stage.stage}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-neutral-700">{stage.stage}</span>
            <span className="text-neutral-500">
              {stage.count.toLocaleString("es-CL")} ({stage.percentage}%)
            </span>
          </div>
          <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${
                index === 0
                  ? "bg-blue-500"
                  : index === 1
                  ? "bg-cyan-500"
                  : index === 2
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${maxCount > 0 ? (stage.count / maxCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleBarChart({ data }: { data: Array<{ date: string; views: number; contacts: number }> }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.views, d.contacts)), 1);

  return (
    <div className="h-64 flex items-end gap-1">
      {data.map((day) => (
        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col gap-0.5" style={{ height: "200px" }}>
            <div
              className="w-full bg-andino-500 rounded-t transition-all duration-300"
              style={{ height: `${(day.views / maxValue) * 100}%` }}
              title={`Vistas: ${day.views}`}
            />
            <div
              className="w-full bg-amber-500 rounded-b transition-all duration-300"
              style={{ height: `${(day.contacts / maxValue) * 100}%` }}
              title={`Contactos: ${day.contacts}`}
            />
          </div>
          <span className="text-[10px] text-neutral-400 rotate-45 origin-left whitespace-nowrap">
            {new Date(day.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error("Error al cargar datos");
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = () => {
    if (!data) return;

    const rows: string[][] = [];

    // Overview
    rows.push(["=== Resumen General ==="]);
    rows.push(["Métrica", "Valor", "Cambio %"]);
    rows.push(["Vistas totales", data.overview.totalPageViews.toString(), `${data.overview.comparison.pageViewsChange}%`]);
    rows.push(["Visitantes únicos", data.overview.uniqueVisitors.toString(), `${data.overview.comparison.visitorsChange}%`]);
    rows.push(["Contactos totales", data.overview.totalContacts.toString(), `${data.overview.comparison.contactsChange}%`]);
    rows.push(["Leads totales", data.overview.totalLeads.toString(), `${data.overview.comparison.leadsChange}%`]);
    rows.push(["Búsquedas", data.overview.totalSearches.toString(), ""]);
    rows.push(["Favoritos", data.overview.totalFavorites.toString(), ""]);
    rows.push(["Compartidos", data.overview.totalShares.toString(), ""]);
    rows.push([]);

    // By Day
    rows.push(["=== Por Día ==="]);
    rows.push(["Fecha", "Vistas", "Contactos", "Visitantes"]);
    data.byDay.forEach((day) => {
      rows.push([day.date, day.views.toString(), day.contacts.toString(), day.visitors.toString()]);
    });
    rows.push([]);

    // By Device
    rows.push(["=== Por Dispositivo ==="]);
    rows.push(["Dispositivo", "Vistas"]);
    Object.entries(data.byDevice).forEach(([device, count]) => {
      rows.push([device, count.toString()]);
    });
    rows.push([]);

    // By Source
    rows.push(["=== Por Fuente ==="]);
    rows.push(["Fuente", "Vistas"]);
    Object.entries(data.bySource).forEach(([source, count]) => {
      rows.push([source, count.toString()]);
    });
    rows.push([]);

    // Contact Types
    rows.push(["=== Tipos de Contacto ==="]);
    rows.push(["Tipo", "Cantidad"]);
    Object.entries(data.byContactType).forEach(([type, count]) => {
      rows.push([type, count.toString()]);
    });
    rows.push([]);

    // Top Dealers
    rows.push(["=== Top Automotoras ==="]);
    rows.push(["Nombre", "Contactos"]);
    data.topDealers.forEach((dealer) => {
      rows.push([dealer.tradeName, dealer.contacts.toString()]);
    });
    rows.push([]);

    // Top Vehicles
    rows.push(["=== Top Vehículos ==="]);
    rows.push(["Título", "Marca", "Modelo", "Vistas"]);
    data.topVehicles.forEach((vehicle) => {
      rows.push([vehicle.title, vehicle.brand, vehicle.model, vehicle.views.toString()]);
    });

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-plataforma-${period}dias-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-neutral-600 mt-1">Estadísticas de la plataforma</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-neutral-600 mt-1">Estadísticas de la plataforma</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error || "Error al cargar datos"}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const deviceIcons: Record<string, React.ElementType> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };

  const contactTypeLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    WHATSAPP_CLICK: { label: "WhatsApp", icon: MessageCircle, color: "text-green-600 bg-green-100" },
    PHONE_REVEAL: { label: "Ver teléfono", icon: Eye, color: "text-blue-600 bg-blue-100" },
    PHONE_CALL: { label: "Llamadas", icon: Phone, color: "text-purple-600 bg-purple-100" },
    CHAT_START: { label: "Chat", icon: MessageCircle, color: "text-cyan-600 bg-cyan-100" },
    CONTACT_FORM: { label: "Formulario", icon: Mail, color: "text-amber-600 bg-amber-100" },
  };

  const totalDeviceViews = Object.values(data.byDevice).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-neutral-600 mt-1">Estadísticas de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                Últimos {p.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vistas totales"
          value={data.overview.totalPageViews}
          change={data.overview.comparison.pageViewsChange}
          icon={Eye}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Visitantes únicos"
          value={data.overview.uniqueVisitors}
          change={data.overview.comparison.visitorsChange}
          icon={Users}
          iconColor="text-green-600"
        />
        <StatCard
          title="Contactos"
          value={data.overview.totalContacts}
          change={data.overview.comparison.contactsChange}
          icon={Phone}
          iconColor="text-amber-600"
        />
        <StatCard
          title="Leads generados"
          value={data.overview.totalLeads}
          change={data.overview.comparison.leadsChange}
          icon={BarChart3}
          iconColor="text-purple-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Búsquedas realizadas"
          value={data.overview.totalSearches}
          icon={Search}
          iconColor="text-cyan-600"
        />
        <StatCard
          title="Favoritos agregados"
          value={data.overview.totalFavorites}
          icon={Heart}
          iconColor="text-red-500"
        />
        <StatCard
          title="Veces compartido"
          value={data.overview.totalShares}
          icon={Share2}
          iconColor="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Tráfico y Contactos por Día</h3>
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-andino-500 rounded" />
              <span className="text-neutral-600">Vistas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded" />
              <span className="text-neutral-600">Contactos</span>
            </div>
          </div>
          <SimpleBarChart data={data.byDay} />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Funnel de Conversión</h3>
          <FunnelChart data={data.funnel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Por Dispositivo</h3>
          <div className="space-y-3">
            {Object.entries(data.byDevice).map(([device, count]) => {
              const Icon = deviceIcons[device] || Monitor;
              const percentage = totalDeviceViews > 0 ? Math.round((count / totalDeviceViews) * 100) : 0;
              return (
                <div key={device} className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Icon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-neutral-700">{device}</span>
                      <span className="text-neutral-500">{count.toLocaleString("es-CL")} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-andino-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Por Fuente</h3>
          <div className="space-y-3">
            {Object.entries(data.bySource).map(([source, count]) => {
              const totalSource = Object.values(data.bySource).reduce((a, b) => a + b, 0);
              const percentage = totalSource > 0 ? Math.round((count / totalSource) * 100) : 0;
              return (
                <div key={source} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${source === "marketplace" ? "bg-blue-100" : "bg-green-100"}`}>
                    {source === "marketplace" ? (
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-neutral-700">
                        {source === "marketplace" ? "Marketplace" : "Micrositios"}
                      </span>
                      <span className="text-neutral-500">{count.toLocaleString("es-CL")} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          source === "marketplace" ? "bg-blue-500" : "bg-green-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Types */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Tipos de Contacto</h3>
          <div className="space-y-3">
            {Object.entries(data.byContactType)
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const config = contactTypeLabels[type] || {
                  label: type,
                  icon: Phone,
                  color: "text-neutral-600 bg-neutral-100",
                };
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color.split(" ")[1]}`}>
                      <Icon className={`h-5 w-5 ${config.color.split(" ")[0]}`} />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{config.label}</span>
                      <span className="text-sm font-medium text-neutral-900">{count.toLocaleString("es-CL")}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dealers */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Top Automotoras</h3>
            <Link
              href="/admin/automotoras"
              className="text-sm text-andino-600 hover:text-andino-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {data.topDealers.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4 text-center">Sin datos en este período</p>
          ) : (
            <div className="space-y-3">
              {data.topDealers.map((dealer, index) => (
                <div key={dealer.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/automotoras/${dealer.id}`}
                      className="text-sm font-medium text-neutral-900 hover:text-andino-600 truncate block"
                    >
                      {dealer.tradeName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <Phone className="h-4 w-4" />
                    {dealer.contacts}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Vehicles */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Top Vehículos</h3>
            <Link
              href="/admin/vehiculos"
              className="text-sm text-andino-600 hover:text-andino-700 flex items-center gap-1"
            >
              Ver todos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {data.topVehicles.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4 text-center">Sin datos en este período</p>
          ) : (
            <div className="space-y-3">
              {data.topVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/vehiculos/${vehicle.id}`}
                      className="text-sm font-medium text-neutral-900 hover:text-andino-600 truncate block"
                    >
                      {vehicle.brand} {vehicle.model}
                    </Link>
                    <p className="text-xs text-neutral-500 truncate">{vehicle.title}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <Eye className="h-4 w-4" />
                    {vehicle.views}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
