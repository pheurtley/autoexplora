"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Car,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Phone,
  Mail,
  ArrowUpRight,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Globe,
  MousePointer,
} from "lucide-react";
import { DealerStatsCard } from "@/components/dealer";

interface Stats {
  totalVehicles: number;
  activeVehicles: number;
  soldVehicles: number;
  totalViews: number;
}

interface ContactStats {
  period: number;
  totalContacts: number;
  byType: {
    whatsapp: number;
    phoneReveal: number;
    phoneCall: number;
    chat: number;
    form: number;
  };
  bySource: {
    marketplace: number;
    microsite: number;
  };
  byDay: Array<{ date: string; count: number }>;
  topVehicles: Array<{
    vehicleId: string;
    title: string;
    slug: string;
    count: number;
  }>;
  conversionRate: number;
}

interface TrafficStats {
  period: number;
  totalPageViews: number;
  uniqueVisitors: number;
  avgPagesPerVisitor: number;
  comparison: {
    pageViewsChange: number;
    visitorsChange: number;
  };
  byDevice: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  bySource: {
    marketplace: number;
    microsite: number;
  };
  byDay: Array<{ date: string; count: number }>;
  topReferrers: Array<{ domain: string; count: number }>;
}

interface FunnelStats {
  period: number;
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  conversionRates: {
    viewToVehicle: number;
    vehicleToContact: number;
    contactToLead: number;
    overall: number;
  };
}

export default function DealerStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState<"overview" | "traffic" | "contacts">("overview");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchContactStats();
    fetchTrafficStats();
    fetchFunnelStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dealer/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactStats = async () => {
    try {
      const response = await fetch(`/api/dealer/stats/contacts?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setContactStats(data);
      }
    } catch (error) {
      console.error("Error fetching contact stats:", error);
    }
  };

  const fetchTrafficStats = async () => {
    try {
      const response = await fetch(`/api/dealer/stats/traffic?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setTrafficStats(data);
      }
    } catch (error) {
      console.error("Error fetching traffic stats:", error);
    }
  };

  const fetchFunnelStats = async () => {
    try {
      const response = await fetch(`/api/dealer/stats/funnel?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setFunnelStats(data);
      }
    } catch (error) {
      console.error("Error fetching funnel stats:", error);
    }
  };

  const exportToCSV = () => {
    if (!contactStats || !trafficStats) return;

    const rows = [
      ["Métrica", "Valor"],
      ["Período", `${period} días`],
      [""],
      ["TRÁFICO"],
      ["Páginas vistas", trafficStats.totalPageViews],
      ["Visitantes únicos", trafficStats.uniqueVisitors],
      ["Páginas por visitante", trafficStats.avgPagesPerVisitor],
      [""],
      ["DISPOSITIVOS"],
      ["Desktop", trafficStats.byDevice.desktop],
      ["Mobile", trafficStats.byDevice.mobile],
      ["Tablet", trafficStats.byDevice.tablet],
      [""],
      ["CONTACTOS"],
      ["Total contactos", contactStats.totalContacts],
      ["WhatsApp", contactStats.byType.whatsapp],
      ["Llamadas", contactStats.byType.phoneReveal + contactStats.byType.phoneCall],
      ["Chat", contactStats.byType.chat],
      ["Formularios", contactStats.byType.form],
      [""],
      ["FUENTES"],
      ["Marketplace", contactStats.bySource.marketplace],
      ["Micrositio", contactStats.bySource.microsite],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estadisticas-${period}dias-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  const maxDayCount = trafficStats
    ? Math.max(...trafficStats.byDay.map((d) => d.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Estadísticas</h1>
          <p className="text-neutral-600 mt-1">
            Analiza el rendimiento de tu automotora
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Period Selector and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
          {[
            { id: "overview", label: "Resumen" },
            { id: "traffic", label: "Tráfico" },
            { id: "contacts", label: "Contactos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? "bg-andino-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {p} días
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Vehicles Stats Grid */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DealerStatsCard
                title="Total Vehículos"
                value={stats.totalVehicles}
                icon={Car}
                color="blue"
              />
              <DealerStatsCard
                title="Vehículos Activos"
                value={stats.activeVehicles}
                icon={BarChart3}
                color="green"
              />
              <DealerStatsCard
                title="Vehículos Vendidos"
                value={stats.soldVehicles}
                icon={TrendingUp}
                color="purple"
              />
              <DealerStatsCard
                title="Total Visitas"
                value={stats.totalViews.toLocaleString("es-CL")}
                icon={Eye}
                color="amber"
              />
            </div>
          )}

          {/* Traffic and Contacts Overview */}
          {trafficStats && contactStats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Visitantes únicos</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {trafficStats.uniqueVisitors.toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    trafficStats.comparison.visitorsChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {trafficStats.comparison.visitorsChange >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(trafficStats.comparison.visitorsChange)}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Páginas vistas</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {trafficStats.totalPageViews.toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    trafficStats.comparison.pageViewsChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {trafficStats.comparison.pageViewsChange >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(trafficStats.comparison.pageViewsChange)}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Total contactos</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {contactStats.totalContacts}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Tasa de conversión</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {contactStats.conversionRate}%
                </p>
              </div>
            </div>
          )}

          {/* Conversion Funnel */}
          {funnelStats && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-6">
                Funnel de conversión
              </h3>
              <div className="space-y-4">
                {funnelStats.funnel.map((stage, i) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700">
                        {stage.stage}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {stage.count.toLocaleString("es-CL")} ({stage.percentage}%)
                      </span>
                    </div>
                    <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          i === 0 ? "bg-blue-500" :
                          i === 1 ? "bg-purple-500" :
                          i === 2 ? "bg-amber-500" : "bg-green-500"
                        }`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Traffic Tab */}
      {activeTab === "traffic" && trafficStats && (
        <>
          {/* Traffic Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {trafficStats.uniqueVisitors.toLocaleString("es-CL")}
                  </p>
                  <p className="text-xs text-neutral-500">Visitantes únicos</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {trafficStats.totalPageViews.toLocaleString("es-CL")}
                  </p>
                  <p className="text-xs text-neutral-500">Páginas vistas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <MousePointer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {trafficStats.avgPagesPerVisitor}
                  </p>
                  <p className="text-xs text-neutral-500">Páginas/visitante</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  trafficStats.comparison.visitorsChange >= 0
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}>
                  {trafficStats.comparison.visitorsChange >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {trafficStats.comparison.visitorsChange >= 0 ? "+" : ""}
                    {trafficStats.comparison.visitorsChange}%
                  </p>
                  <p className="text-xs text-neutral-500">vs período anterior</p>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Chart and Device Breakdown */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-4">
                Visitas por día
              </h3>
              <div className="flex items-end gap-1 h-48">
                {trafficStats.byDay.slice(-30).map((day) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end"
                    title={`${day.date}: ${day.count} visitas`}
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{
                        height: `${(day.count / maxDayCount) * 100}%`,
                        minHeight: day.count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-400">
                <span>{trafficStats.byDay[0]?.date}</span>
                <span>{trafficStats.byDay[trafficStats.byDay.length - 1]?.date}</span>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-4">
                Dispositivos
              </h3>
              <div className="space-y-4">
                {[
                  { key: "desktop", label: "Desktop", icon: Monitor, color: "blue" },
                  { key: "mobile", label: "Mobile", icon: Smartphone, color: "green" },
                  { key: "tablet", label: "Tablet", icon: Tablet, color: "purple" },
                ].map((device) => {
                  const count = trafficStats.byDevice[device.key as keyof typeof trafficStats.byDevice] || 0;
                  const total = Object.values(trafficStats.byDevice).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={device.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <device.icon className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-700">{device.label}</span>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${device.color}-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top Referrers */}
              {trafficStats.topReferrers.length > 0 && (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">
                    Principales fuentes
                  </h4>
                  <div className="space-y-2">
                    {trafficStats.topReferrers.map((ref) => (
                      <div key={ref.domain} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-neutral-400" />
                          <span className="text-neutral-600 truncate">{ref.domain}</span>
                        </div>
                        <span className="text-neutral-500">{ref.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-4">
              Visitas por fuente
            </h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-andino-500"></div>
                <span className="text-sm text-neutral-600">
                  Marketplace:{" "}
                  <span className="font-semibold">{trafficStats.bySource.marketplace}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-neutral-600">
                  Micrositio:{" "}
                  <span className="font-semibold">{trafficStats.bySource.microsite}</span>
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden flex">
              {(trafficStats.bySource.marketplace + trafficStats.bySource.microsite) > 0 && (
                <>
                  <div
                    className="bg-andino-500 h-full"
                    style={{
                      width: `${
                        (trafficStats.bySource.marketplace /
                          (trafficStats.bySource.marketplace + trafficStats.bySource.microsite)) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-purple-500 h-full"
                    style={{
                      width: `${
                        (trafficStats.bySource.microsite /
                          (trafficStats.bySource.marketplace + trafficStats.bySource.microsite)) *
                        100
                      }%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Contacts Tab */}
      {activeTab === "contacts" && contactStats && (
        <>
          {/* Contact Type Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contactStats.byType.whatsapp}
                  </p>
                  <p className="text-xs text-neutral-500">WhatsApp</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contactStats.byType.phoneReveal + contactStats.byType.phoneCall}
                  </p>
                  <p className="text-xs text-neutral-500">Llamadas</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contactStats.byType.chat}
                  </p>
                  <p className="text-xs text-neutral-500">Chat</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contactStats.byType.form}
                  </p>
                  <p className="text-xs text-neutral-500">Formularios</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-andino-100 text-andino-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contactStats.conversionRate}%
                  </p>
                  <p className="text-xs text-neutral-500">Conversión</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart and Top Vehicles */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-4">
                Contactos por día
              </h3>
              <div className="flex items-end gap-1 h-48">
                {contactStats.byDay.slice(-30).map((day) => {
                  const maxContactDay = Math.max(...contactStats.byDay.map((d) => d.count), 1);
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end"
                      title={`${day.date}: ${day.count} contactos`}
                    >
                      <div
                        className="w-full bg-andino-500 rounded-t transition-all hover:bg-andino-600"
                        style={{
                          height: `${(day.count / maxContactDay) * 100}%`,
                          minHeight: day.count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-400">
                <span>{contactStats.byDay[0]?.date}</span>
                <span>{contactStats.byDay[contactStats.byDay.length - 1]?.date}</span>
              </div>
            </div>

            {/* Top Vehicles */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-4">
                Vehículos más contactados
              </h3>
              {contactStats.topVehicles.length > 0 ? (
                <div className="space-y-3">
                  {contactStats.topVehicles.map((vehicle, i) => (
                    <Link
                      key={vehicle.vehicleId}
                      href={`/dealer/vehiculos/${vehicle.vehicleId}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-neutral-400 bg-neutral-100 rounded">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-neutral-900 truncate">
                          {vehicle.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>{vehicle.count}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-8">
                  Sin datos en este período
                </p>
              )}
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-4">
              Contactos por fuente
            </h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-andino-500"></div>
                <span className="text-sm text-neutral-600">
                  Marketplace:{" "}
                  <span className="font-semibold">{contactStats.bySource.marketplace}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-neutral-600">
                  Micrositio:{" "}
                  <span className="font-semibold">{contactStats.bySource.microsite}</span>
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden flex">
              {contactStats.totalContacts > 0 && (
                <>
                  <div
                    className="bg-andino-500 h-full"
                    style={{
                      width: `${
                        (contactStats.bySource.marketplace / contactStats.totalContacts) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-purple-500 h-full"
                    style={{
                      width: `${
                        (contactStats.bySource.microsite / contactStats.totalContacts) * 100
                      }%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
