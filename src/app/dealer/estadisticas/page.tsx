"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Car,
  TrendingUp,
  MessageCircle,
  Phone,
  Mail,
  ArrowUpRight,
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
  totalViews: number;
}

export default function DealerStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchContactStats();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxDayCount = contactStats
    ? Math.max(...contactStats.byDay.map((d) => d.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Estadísticas</h1>
        <p className="text-neutral-600 mt-1">
          Analiza el rendimiento de tu automotora
        </p>
      </div>

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

      {/* Contact Stats Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Interacciones de Contacto
          </h2>
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

        {contactStats && (
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
              {/* Simple Bar Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-4">
                  Contactos por día
                </h3>
                <div className="flex items-end gap-1 h-48">
                  {contactStats.byDay.slice(-30).map((day, i) => (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end"
                      title={`${day.date}: ${day.count} contactos`}
                    >
                      <div
                        className="w-full bg-andino-500 rounded-t transition-all hover:bg-andino-600"
                        style={{
                          height: `${(day.count / maxDayCount) * 100}%`,
                          minHeight: day.count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                  ))}
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
              {/* Progress bar */}
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

        {!contactStats && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
            <p className="text-neutral-500 mt-4">Cargando estadísticas de contacto...</p>
          </div>
        )}
      </div>
    </div>
  );
}
