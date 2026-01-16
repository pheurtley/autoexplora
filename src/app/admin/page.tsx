import Link from "next/link";
import prisma from "@/lib/prisma";
import { StatsCard } from "@/components/admin";
import {
  Car,
  Users,
  Flag,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

async function getStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalVehicles,
    activeVehicles,
    pendingVehicles,
    totalUsers,
    totalReports,
    pendingReports,
    vehiclesLast30Days,
    vehiclesPrevious30Days,
    usersLast30Days,
    usersPrevious30Days,
    recentVehicles,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    prisma.vehicle.count({ where: { status: "DRAFT" } }),
    prisma.user.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.vehicle.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.vehicle.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.vehicle.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const vehiclesTrend =
    vehiclesPrevious30Days > 0
      ? Math.round(
          ((vehiclesLast30Days - vehiclesPrevious30Days) /
            vehiclesPrevious30Days) *
            100
        )
      : 0;

  const usersTrend =
    usersPrevious30Days > 0
      ? Math.round(
          ((usersLast30Days - usersPrevious30Days) / usersPrevious30Days) * 100
        )
      : 0;

  return {
    totalVehicles,
    activeVehicles,
    pendingVehicles,
    totalUsers,
    totalReports,
    pendingReports,
    vehiclesTrend,
    usersTrend,
    recentVehicles,
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-neutral-100 text-neutral-700" },
  ACTIVE: { label: "Activo", color: "bg-green-100 text-green-700" },
  PAUSED: { label: "Pausado", color: "bg-amber-100 text-amber-700" },
  SOLD: { label: "Vendido", color: "bg-blue-100 text-blue-700" },
  EXPIRED: { label: "Expirado", color: "bg-neutral-100 text-neutral-700" },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-700" },
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Resumen general del marketplace
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Vehículos"
          value={stats.totalVehicles}
          subtitle={`${stats.activeVehicles} activos`}
          icon={Car}
          trend={
            stats.vehiclesTrend !== 0
              ? {
                  value: Math.abs(stats.vehiclesTrend),
                  isPositive: stats.vehiclesTrend > 0,
                }
              : undefined
          }
        />
        <StatsCard
          title="Usuarios"
          value={stats.totalUsers}
          icon={Users}
          trend={
            stats.usersTrend !== 0
              ? {
                  value: Math.abs(stats.usersTrend),
                  isPositive: stats.usersTrend > 0,
                }
              : undefined
          }
        />
        <StatsCard
          title="Reportes Pendientes"
          value={stats.pendingReports}
          subtitle={`${stats.totalReports} totales`}
          icon={Flag}
          variant={stats.pendingReports > 0 ? "warning" : "default"}
        />
        <StatsCard
          title="Por Revisar"
          value={stats.pendingVehicles}
          subtitle="vehículos en borrador"
          icon={Clock}
          variant={stats.pendingVehicles > 0 ? "warning" : "default"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vehicles */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Vehículos Recientes
            </h2>
            <Link
              href="/admin/vehiculos"
              className="text-sm text-andino-600 hover:text-andino-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentVehicles.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4 text-center">
                No hay vehículos aún
              </p>
            ) : (
              stats.recentVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 truncate">
                      {vehicle.brand.name} {vehicle.model.name}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {vehicle.user.name || vehicle.user.email}
                    </p>
                  </div>
                  <span
                    className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                      statusLabels[vehicle.status]?.color ||
                      statusLabels.DRAFT.color
                    }`}
                  >
                    {statusLabels[vehicle.status]?.label || vehicle.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/vehiculos?status=DRAFT"
              className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">
                  {stats.pendingVehicles}
                </p>
                <p className="text-sm text-amber-700">Por revisar</p>
              </div>
            </Link>
            <Link
              href="/admin/reportes?status=PENDING"
              className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Flag className="h-8 w-8 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  {stats.pendingReports}
                </p>
                <p className="text-sm text-red-700">Reportes</p>
              </div>
            </Link>
            <Link
              href="/admin/vehiculos?status=ACTIVE"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  {stats.activeVehicles}
                </p>
                <p className="text-sm text-green-700">Activos</p>
              </div>
            </Link>
            <Link
              href="/admin/usuarios"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-blue-700">Usuarios</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
