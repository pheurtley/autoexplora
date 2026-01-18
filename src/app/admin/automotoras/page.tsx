"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  MoreVertical,
  MapPin,
  Car,
  Users,
} from "lucide-react";
import { formatRut } from "@/lib/rut";

interface DealerData {
  id: string;
  slug: string;
  tradeName: string;
  businessName: string;
  rut: string;
  type: string;
  email: string;
  phone: string;
  logo: string | null;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
  region: { name: string };
  _count: {
    vehicles: number;
    users: number;
  };
}

interface StatusCounts {
  PENDING: number;
  ACTIVE: number;
  SUSPENDED: number;
  REJECTED: number;
}

const statusFilters = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "ACTIVE", label: "Activos" },
  { value: "SUSPENDED", label: "Suspendidos" },
  { value: "REJECTED", label: "Rechazados" },
];

const typeFilters = [
  { value: "", label: "Todos los tipos" },
  { value: "AUTOMOTORA", label: "Automotoras" },
  { value: "RENT_A_CAR", label: "Rent a Car" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  PENDING: { label: "Pendiente", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  ACTIVE: { label: "Activo", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  SUSPENDED: { label: "Suspendido", color: "text-red-700", bg: "bg-red-100", icon: Ban },
  REJECTED: { label: "Rechazado", color: "text-neutral-700", bg: "bg-neutral-100", icon: XCircle },
};

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  AUTOMOTORA: { label: "Automotora", color: "text-purple-700", bg: "bg-purple-100" },
  RENT_A_CAR: { label: "Rent a Car", color: "text-teal-700", bg: "bg-teal-100" },
};

export default function AdminAutomotorasPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dealers, setDealers] = useState<DealerData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [counts, setCounts] = useState<StatusCounts>({ PENDING: 0, ACTIVE: 0, SUSPENDED: 0, REJECTED: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/dealers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDealers(data.dealers);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, status, type, search]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if ("status" in updates || "type" in updates || "search" in updates) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleStatusChange = async (dealerId: string, newStatus: string, reason?: string) => {
    setActionLoading(dealerId);
    try {
      const response = await fetch(`/api/admin/dealers/${dealerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason }),
      });

      if (response.ok) {
        fetchDealers();
      } else {
        const result = await response.json();
        alert(result.error || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el estado");
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleApprove = (dealerId: string) => {
    if (confirm("¿Aprobar esta automotora?")) {
      handleStatusChange(dealerId, "ACTIVE");
    }
  };

  const handleReject = (dealerId: string) => {
    const reason = prompt("Razón del rechazo:");
    if (reason) {
      handleStatusChange(dealerId, "REJECTED", reason);
    }
  };

  const handleSuspend = (dealerId: string) => {
    const reason = prompt("Razón de la suspensión:");
    if (reason) {
      handleStatusChange(dealerId, "SUSPENDED", reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Automotoras</h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "automotora" : "automotoras"} en total
          </p>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-2">
          {counts.PENDING > 0 && (
            <button
              onClick={() => updateParams({ status: "PENDING" })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              <Clock className="w-4 h-4" />
              {counts.PENDING} pendientes
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, RUT o email..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => updateParams({ type: e.target.value })}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
        >
          {typeFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dealers Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando automotoras...</p>
        </div>
      ) : dealers.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No hay automotoras para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Automotora</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Tipo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Ubicación</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">Vehículos</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">Usuarios</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Registro</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((dealer) => {
                  const statusInfo = statusConfig[dealer.status] || statusConfig.PENDING;
                  const typeInfo = typeConfig[dealer.type] || typeConfig.AUTOMOTORA;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={dealer.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/automotoras/${dealer.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-andino-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {dealer.logo ? (
                              <img src={dealer.logo} alt={dealer.tradeName} className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="w-5 h-5 text-andino-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate hover:text-andino-600">
                              {dealer.tradeName}
                            </p>
                            <p className="text-sm text-neutral-500 truncate">{formatRut(dealer.rut)}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <MapPin className="w-3 h-3" />
                          {dealer.region.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-neutral-600">
                          <Car className="w-4 h-4" />
                          {dealer._count.vehicles}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-neutral-600">
                          <Users className="w-4 h-4" />
                          {dealer._count.users}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600">
                          {new Date(dealer.createdAt).toLocaleDateString("es-CL")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === dealer.id ? null : dealer.id)}
                              disabled={actionLoading === dealer.id}
                              className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenu === dealer.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                                <Link
                                  href={`/admin/automotoras/${dealer.id}`}
                                  className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                                >
                                  Ver detalles
                                </Link>
                                <hr className="my-1 border-neutral-100" />
                                {dealer.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(dealer.id)}
                                      className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                                    >
                                      Aprobar
                                    </button>
                                    <button
                                      onClick={() => handleReject(dealer.id)}
                                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                    >
                                      Rechazar
                                    </button>
                                  </>
                                )}
                                {dealer.status === "ACTIVE" && (
                                  <button
                                    onClick={() => handleSuspend(dealer.id)}
                                    className="w-full px-4 py-2 text-sm text-left text-amber-600 hover:bg-amber-50"
                                  >
                                    Suspender
                                  </button>
                                )}
                                {(dealer.status === "SUSPENDED" || dealer.status === "REJECTED") && (
                                  <button
                                    onClick={() => handleApprove(dealer.id)}
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
              onClick={() => updateParams({ page: (page - 1).toString() })}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => updateParams({ page: (page + 1).toString() })}
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
