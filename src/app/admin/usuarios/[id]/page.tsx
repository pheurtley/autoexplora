"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Car,
  Heart,
  Flag,
  Ban,
  Shield,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  role: string;
  bannedAt: string | null;
  banReason: string | null;
  suspendedUntil: string | null;
  createdAt: string;
  vehicles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    price: number;
    createdAt: string;
    brand: { name: string };
    model: { name: string };
    images: { url: string }[];
  }>;
  reportsMade: Array<{
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    vehicle: {
      id: string;
      brand: { name: string };
      model: { name: string };
    };
  }>;
  _count: {
    vehicles: number;
    favorites: number;
    reportsMade: number;
  };
}

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: typeof User }> = {
  USER: { label: "Usuario", color: "text-neutral-700", bg: "bg-neutral-100", icon: User },
  MODERATOR: { label: "Moderador", color: "text-blue-700", bg: "bg-blue-100", icon: Shield },
  ADMIN: { label: "Administrador", color: "text-purple-700", bg: "bg-purple-100", icon: ShieldCheck },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Borrador", color: "text-neutral-700", bg: "bg-neutral-100" },
  ACTIVE: { label: "Activo", color: "text-green-700", bg: "bg-green-100" },
  PAUSED: { label: "Pausado", color: "text-amber-700", bg: "bg-amber-100" },
  SOLD: { label: "Vendido", color: "text-blue-700", bg: "bg-blue-100" },
  EXPIRED: { label: "Expirado", color: "text-neutral-700", bg: "bg-neutral-100" },
  REJECTED: { label: "Rechazado", color: "text-red-700", bg: "bg-red-100" },
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/usuarios/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 404) {
        router.push("/admin/usuarios");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, data?: Record<string, unknown>) => {
    if (!user) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        fetchUser();
      } else {
        const result = await response.json();
        alert(result.error || "Error al realizar la acción");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al realizar la acción");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = () => {
    const reason = prompt("Razón del baneo:");
    if (reason) {
      handleAction("ban", { reason });
    }
  };

  const handleSuspend = () => {
    const days = prompt("Días de suspensión:");
    if (days && !isNaN(parseInt(days))) {
      handleAction("suspend", { suspendDays: parseInt(days) });
    }
  };

  const handleChangeRole = () => {
    const newRole = prompt("Nuevo rol (USER, MODERATOR, ADMIN):");
    if (newRole && ["USER", "MODERATOR", "ADMIN"].includes(newRole.toUpperCase())) {
      handleAction("changeRole", { role: newRole.toUpperCase() });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Usuario no encontrado</p>
      </div>
    );
  }

  const roleInfo = roleConfig[user.role] || roleConfig.USER;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/usuarios"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">
            {user.name || "Sin nombre"}
          </h1>
          <p className="text-neutral-600 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="flex flex-wrap gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${roleInfo.bg} ${roleInfo.color}`}>
          <RoleIcon className="w-4 h-4" />
          {roleInfo.label}
        </span>

        {user.bannedAt ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-red-100 text-red-700">
            <Ban className="w-4 h-4" />
            Baneado
          </span>
        ) : user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
            Suspendido hasta {new Date(user.suspendedUntil).toLocaleDateString("es-CL")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-700">
            Activo
          </span>
        )}
      </div>

      {/* Ban Reason */}
      {user.bannedAt && user.banReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-800">Razón del baneo:</p>
          <p className="text-sm text-red-700 mt-1">{user.banReason}</p>
          <p className="text-xs text-red-600 mt-2">
            Baneado el {new Date(user.bannedAt).toLocaleDateString("es-CL")}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-neutral-200">
        {user.bannedAt ? (
          <button
            onClick={() => handleAction("unban")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Quitar baneo
          </button>
        ) : (
          <>
            {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
              <button
                onClick={() => handleAction("unsuspend")}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Quitar suspensión
              </button>
            ) : (
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                Suspender
              </button>
            )}
            <button
              onClick={handleBan}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              Banear
            </button>
          </>
        )}
        <button
          onClick={handleChangeRole}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
        >
          <Shield className="h-4 w-4" />
          Cambiar rol
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Vehicles */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-neutral-900">
                Vehículos ({user._count.vehicles})
              </h2>
              {user._count.vehicles > 10 && (
                <Link
                  href={`/admin/vehiculos?userId=${user.id}`}
                  className="text-sm text-andino-600 hover:text-andino-700"
                >
                  Ver todos
                </Link>
              )}
            </div>
            {user.vehicles.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4 text-center">
                No tiene vehículos publicados
              </p>
            ) : (
              <div className="space-y-3">
                {user.vehicles.map((vehicle) => {
                  const vehicleStatus = statusConfig[vehicle.status] || statusConfig.DRAFT;
                  const primaryImage = vehicle.images[0]?.url;

                  return (
                    <Link
                      key={vehicle.id}
                      href={`/admin/vehiculos/${vehicle.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={vehicle.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                            Sin foto
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-neutral-900 truncate">
                          {vehicle.brand.name} {vehicle.model.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {formatPrice(vehicle.price)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${vehicleStatus.bg} ${vehicleStatus.color}`}>
                        {vehicleStatus.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Reports */}
          {user.reportsMade.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-4">
                Reportes realizados ({user._count.reportsMade})
              </h2>
              <div className="space-y-3">
                {user.reportsMade.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div>
                      <Link
                        href={`/admin/vehiculos/${report.vehicle.id}`}
                        className="font-medium text-neutral-900 hover:text-andino-600"
                      >
                        {report.vehicle.brand.name} {report.vehicle.model.name}
                      </Link>
                      <p className="text-sm text-neutral-500">{report.reason}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : report.status === "RESOLVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Información</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Mail className="h-4 w-4 text-neutral-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="text-sm text-neutral-900 truncate">{user.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Phone className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Teléfono</p>
                  <p className="text-sm text-neutral-900">{user.phone || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Registrado</p>
                  <p className="text-sm text-neutral-900">
                    {new Date(user.createdAt).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Estadísticas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <Car className="h-5 w-5 text-neutral-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-neutral-900">{user._count.vehicles}</p>
                <p className="text-xs text-neutral-500">Vehículos</p>
              </div>
              <div className="text-center p-3 bg-neutral-50 rounded-lg">
                <Heart className="h-5 w-5 text-neutral-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-neutral-900">{user._count.favorites}</p>
                <p className="text-xs text-neutral-500">Favoritos</p>
              </div>
              <div className="text-center p-3 bg-neutral-50 rounded-lg col-span-2">
                <Flag className="h-5 w-5 text-neutral-400 mx-auto mb-1" />
                <p className="text-lg font-semibold text-neutral-900">{user._count.reportsMade}</p>
                <p className="text-xs text-neutral-500">Reportes realizados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
