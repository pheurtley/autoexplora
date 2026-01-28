"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Car,
  Eye,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui";

interface Vehicle {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  views: number;
  publishedAt: string;
  brand: { name: string };
  model: { name: string };
  year: number;
  images: { url: string }[];
  _count: { favorites: number };
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Activo", bg: "bg-green-100", color: "text-green-700" },
  PAUSED: { label: "Pausado", bg: "bg-neutral-100", color: "text-neutral-700" },
  SOLD: { label: "Vendido", bg: "bg-blue-100", color: "text-blue-700" },
  EXPIRED: { label: "Expirado", bg: "bg-amber-100", color: "text-amber-700" },
  REJECTED: { label: "Rechazado", bg: "bg-red-100", color: "text-red-700" },
  DRAFT: { label: "Borrador", bg: "bg-neutral-100", color: "text-neutral-700" },
};

const statusFilters = [
  { value: "", label: "Todos" },
  { value: "ACTIVE", label: "Activos" },
  { value: "PAUSED", label: "Pausados" },
  { value: "SOLD", label: "Vendidos" },
  { value: "EXPIRED", label: "Expirados" },
];

export default function DealerVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, [page, statusFilter]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      // Use dealer vehicles API
      const response = await fetch(`/api/dealer/vehiculos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/dealer/vehiculos/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchVehicles();
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
    } finally {
      setOpenMenu(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Vehículos</h1>
          <p className="text-neutral-600 mt-1">
            Gestiona tus publicaciones de vehículos
          </p>
        </div>

        <Link href="/dealer/vehiculos/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Publicar Vehículo
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando vehículos...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Car className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No tienes vehículos publicados</p>
          <Link href="/dealer/vehiculos/nuevo">
            <Button className="mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Publicar tu primer vehículo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Vehículo
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Precio
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                    Visitas
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                    Favoritos
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Publicado
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const status = statusConfig[vehicle.status] || statusConfig.DRAFT;

                  return (
                    <tr
                      key={vehicle.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/cuenta/publicaciones/${vehicle.id}/editar`}
                          className="flex items-center gap-3"
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
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate hover:text-andino-600">
                              {vehicle.title}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {vehicle.brand.name} {vehicle.model.name} {vehicle.year}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-neutral-900">
                          ${vehicle.price.toLocaleString("es-CL")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-neutral-600">
                          <Eye className="w-4 h-4" />
                          <span>{vehicle.views}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-red-500">
                          <Heart className="w-4 h-4" />
                          <span>{vehicle._count?.favorites || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600">
                          {new Date(vehicle.publishedAt).toLocaleDateString("es-CL")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/cuenta/publicaciones/${vehicle.id}/editar`}
                            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === vehicle.id ? null : vehicle.id)
                              }
                              className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenu === vehicle.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                                <Link
                                  href={`/vehiculos/${vehicle.slug}`}
                                  target="_blank"
                                  className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                                >
                                  Ver publicación
                                </Link>
                                <hr className="my-1 border-neutral-100" />
                                {vehicle.status === "ACTIVE" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(vehicle.id, "PAUSED")
                                      }
                                      className="w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50"
                                    >
                                      Pausar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(vehicle.id, "SOLD")
                                      }
                                      className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                                    >
                                      Marcar vendido
                                    </button>
                                  </>
                                )}
                                {vehicle.status === "PAUSED" && (
                                  <button
                                    onClick={() =>
                                      handleStatusChange(vehicle.id, "ACTIVE")
                                    }
                                    className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                                  >
                                    Reactivar
                                  </button>
                                )}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
