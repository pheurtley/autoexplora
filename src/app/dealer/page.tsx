"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Eye,
  CheckCircle,
  DollarSign,
  Plus,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui";
import { DealerStatsCard } from "@/components/dealer";

interface DealerStats {
  totalVehicles: number;
  activeVehicles: number;
  soldVehicles: number;
  totalViews: number;
}

interface RecentVehicle {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  createdAt: string;
  images: { url: string }[];
}

interface DealerProfile {
  dealer: {
    id: string;
    tradeName: string;
    status: string;
  };
}

export default function DealerDashboardPage() {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [stats, setStats] = useState<DealerStats | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/dealer/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dealer/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentVehicles(data.recentVehicles || []);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    Promise.all([fetchProfile(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  const isPending = profile?.dealer?.status === "PENDING";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Bienvenido a tu panel de concesionario
          </p>
        </div>

        {!isPending && (
          <Link href="/dealer/vehiculos/nuevo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Publicar Vehículo
            </Button>
          </Link>
        )}
      </div>

      {/* Pending Status Alert */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Cuenta pendiente de aprobación</h3>
            <p className="text-sm text-amber-700 mt-1">
              Tu cuenta de concesionario está siendo revisada. Te notificaremos por email cuando sea aprobada.
              Mientras tanto, puedes completar tu perfil.
            </p>
            <Link
              href="/dealer/perfil"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Completar perfil
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && !isPending && (
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
            icon={CheckCircle}
            color="green"
          />
          <DealerStatsCard
            title="Vehículos Vendidos"
            value={stats.soldVehicles}
            icon={DollarSign}
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

      {/* Recent Vehicles */}
      {!isPending && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Vehículos Recientes</h2>
            <Link
              href="/dealer/vehiculos"
              className="text-sm text-andino-600 hover:text-andino-700 flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentVehicles.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No tienes vehículos publicados</p>
              <Link href="/dealer/vehiculos/nuevo">
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar tu primer vehículo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentVehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/cuenta/publicaciones/${vehicle.id}/editar`}
                  className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-16 h-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                    {vehicle.images[0]?.url && (
                      <img
                        src={vehicle.images[0].url}
                        alt={vehicle.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {vehicle.title}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(vehicle.createdAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{vehicle.views}</span>
                    </div>
                    <StatusBadge status={vehicle.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Gestionar Vehículos"
            description="Ver, editar y administrar tus publicaciones"
            href="/dealer/vehiculos"
            icon={Car}
          />
          <QuickActionCard
            title="Ver Estadísticas"
            description="Analiza el rendimiento de tus publicaciones"
            href="/dealer/estadisticas"
            icon={Eye}
          />
          <QuickActionCard
            title="Editar Perfil"
            description="Actualiza la información de tu concesionario"
            href="/dealer/perfil"
            icon={AlertCircle}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: "Activo", bg: "bg-green-100", color: "text-green-700" },
    PAUSED: { label: "Pausado", bg: "bg-neutral-100", color: "text-neutral-700" },
    SOLD: { label: "Vendido", bg: "bg-blue-100", color: "text-blue-700" },
    EXPIRED: { label: "Expirado", bg: "bg-amber-100", color: "text-amber-700" },
    REJECTED: { label: "Rechazado", bg: "bg-red-100", color: "text-red-700" },
    DRAFT: { label: "Borrador", bg: "bg-neutral-100", color: "text-neutral-700" },
  };

  const { label, bg, color } = config[status] || config.DRAFT;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bg} ${color}`}>
      {label}
    </span>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Car;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-andino-300 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-andino-100 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-andino-600" />
      </div>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
    </Link>
  );
}
