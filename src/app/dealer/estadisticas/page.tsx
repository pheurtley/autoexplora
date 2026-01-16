"use client";

import { useState, useEffect } from "react";
import { BarChart3, Eye, Car, TrendingUp, Calendar } from "lucide-react";
import { DealerStatsCard } from "@/components/dealer";

interface Stats {
  totalVehicles: number;
  activeVehicles: number;
  soldVehicles: number;
  totalViews: number;
}

export default function DealerStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Estadísticas</h1>
        <p className="text-neutral-600 mt-1">
          Analiza el rendimiento de tu concesionario
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Placeholder for more stats */}
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Más estadísticas próximamente
        </h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Estamos trabajando en gráficos detallados y análisis de rendimiento
          para ayudarte a entender mejor el comportamiento de tus publicaciones.
        </p>
      </div>
    </div>
  );
}
