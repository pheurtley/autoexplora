"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import {
  Eye,
  MoreVertical,
  Star,
  Flag,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  Building2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Vehicle {
  id: string;
  title: string;
  slug: string;
  price: number;
  year: number;
  status: string;
  featured: boolean;
  views: number;
  createdAt: string;
  brand: { name: string };
  model: { name: string };
  user: { id: string; name: string | null; email: string | null };
  dealer: { id: string; tradeName: string; slug: string } | null;
  images: { url: string; isPrimary: boolean }[];
  _count: { reports: number };
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  onRefresh: () => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  DRAFT: {
    label: "Borrador",
    color: "text-neutral-700",
    bg: "bg-neutral-100",
  },
  ACTIVE: { label: "Activo", color: "text-green-700", bg: "bg-green-100" },
  PAUSED: { label: "Pausado", color: "text-amber-700", bg: "bg-amber-100" },
  SOLD: { label: "Vendido", color: "text-blue-700", bg: "bg-blue-100" },
  EXPIRED: {
    label: "Expirado",
    color: "text-neutral-700",
    bg: "bg-neutral-100",
  },
  REJECTED: { label: "Rechazado", color: "text-red-700", bg: "bg-red-100" },
};

export function VehicleTable({ vehicles, onRefresh }: VehicleTableProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (
    vehicleId: string,
    action: string,
    reason?: string
  ) => {
    setLoading(vehicleId);
    try {
      const response = await fetch(`/api/admin/vehiculos/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || "Error al realizar la acción");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al realizar la acción");
    } finally {
      setLoading(null);
      setOpenMenu(null);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer.")) {
      return;
    }

    setLoading(vehicleId);
    try {
      const response = await fetch(`/api/admin/vehiculos/${vehicleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar el vehículo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el vehículo");
    } finally {
      setLoading(null);
      setOpenMenu(null);
    }
  };

  const handleReject = async (vehicleId: string) => {
    const reason = prompt("Ingresa la razón del rechazo:");
    if (reason) {
      await handleAction(vehicleId, "reject", reason);
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">No hay vehículos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Vehículo
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Usuario
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Automotora
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Precio
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Estado
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                Vistas
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                Reportes
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const status = statusConfig[vehicle.status] || statusConfig.DRAFT;
              const primaryImage = vehicle.images[0]?.url;

              return (
                <tr
                  key={vehicle.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
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
                        {vehicle.featured && (
                          <div className="absolute top-1 right-1 bg-amber-500 rounded-full p-0.5">
                            <Star className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/vehiculos/${vehicle.id}`}
                          className="font-medium text-neutral-900 hover:text-andino-600 truncate block"
                        >
                          {vehicle.brand.name} {vehicle.model.name}
                        </Link>
                        <p className="text-sm text-neutral-500">
                          {vehicle.year}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/usuarios/${vehicle.user.id}`}
                      className="text-sm text-neutral-600 hover:text-andino-600"
                    >
                      {vehicle.user.name || vehicle.user.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {vehicle.dealer ? (
                      <Link
                        href={`/admin/automotoras/${vehicle.dealer.id}`}
                        className="inline-flex items-center gap-1.5 text-sm text-andino-600 hover:text-andino-700"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {vehicle.dealer.tradeName}
                      </Link>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900">
                      {formatPrice(vehicle.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-neutral-600">
                      {vehicle.views}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {vehicle._count.reports > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        <Flag className="w-3 h-3" />
                        {vehicle._count.reports}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/vehiculo/${vehicle.slug}`}
                        target="_blank"
                        className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                        title="Ver publicación"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <div className="relative" ref={openMenu === vehicle.id ? menuRef : null}>
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === vehicle.id ? null : vehicle.id
                            )
                          }
                          disabled={loading === vehicle.id}
                          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenu === vehicle.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                            {vehicle.status !== "ACTIVE" && (
                              <button
                                onClick={() =>
                                  handleAction(vehicle.id, "approve")
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprobar
                              </button>
                            )}
                            {vehicle.status !== "REJECTED" && (
                              <button
                                onClick={() => handleReject(vehicle.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </button>
                            )}
                            {vehicle.status === "ACTIVE" && (
                              <button
                                onClick={() =>
                                  handleAction(vehicle.id, "pause")
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-amber-600 hover:bg-amber-50"
                              >
                                <Pause className="w-4 h-4" />
                                Pausar
                              </button>
                            )}
                            {vehicle.status === "PAUSED" && (
                              <button
                                onClick={() =>
                                  handleAction(vehicle.id, "unpause")
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                              >
                                <Play className="w-4 h-4" />
                                Reactivar
                              </button>
                            )}
                            <hr className="my-1 border-neutral-100" />
                            {vehicle.featured ? (
                              <button
                                onClick={() =>
                                  handleAction(vehicle.id, "unfeature")
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50"
                              >
                                <Star className="w-4 h-4" />
                                Quitar destacado
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleAction(vehicle.id, "feature")
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-amber-600 hover:bg-amber-50"
                              >
                                <Star className="w-4 h-4 fill-amber-600" />
                                Destacar
                              </button>
                            )}
                            <hr className="my-1 border-neutral-100" />
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
