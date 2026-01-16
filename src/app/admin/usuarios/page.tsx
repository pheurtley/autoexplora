"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Ban,
  Shield,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  bannedAt: string | null;
  banReason: string | null;
  suspendedUntil: string | null;
  createdAt: string;
  _count: {
    vehicles: number;
    reportsMade: number;
  };
}

const roleFilters = [
  { value: "", label: "Todos los roles" },
  { value: "USER", label: "Usuarios" },
  { value: "MODERATOR", label: "Moderadores" },
  { value: "ADMIN", label: "Administradores" },
];

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: typeof User }> = {
  USER: { label: "Usuario", color: "text-neutral-700", bg: "bg-neutral-100", icon: User },
  MODERATOR: { label: "Moderador", color: "text-blue-700", bg: "bg-blue-100", icon: Shield },
  ADMIN: { label: "Admin", color: "text-purple-700", bg: "bg-purple-100", icon: ShieldCheck },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const role = searchParams.get("role") || "";
  const banned = searchParams.get("banned") || "";
  const search = searchParams.get("search") || "";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (role) params.set("role", role);
      if (banned) params.set("banned", banned);
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/usuarios?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, role, banned, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if ("role" in updates || "banned" in updates || "search" in updates) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleAction = async (userId: string, action: string, data?: Record<string, unknown>) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const result = await response.json();
        alert(result.error || "Error al realizar la acción");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al realizar la acción");
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleBan = (userId: string) => {
    const reason = prompt("Razón del baneo:");
    if (reason) {
      handleAction(userId, "ban", { reason });
    }
  };

  const handleSuspend = (userId: string) => {
    const days = prompt("Días de suspensión:");
    if (days && !isNaN(parseInt(days))) {
      handleAction(userId, "suspend", { suspendDays: parseInt(days) });
    }
  };

  const handleChangeRole = (userId: string) => {
    const newRole = prompt("Nuevo rol (USER, MODERATOR, ADMIN):");
    if (newRole && ["USER", "MODERATOR", "ADMIN"].includes(newRole.toUpperCase())) {
      handleAction(userId, "changeRole", { role: newRole.toUpperCase() });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>
        <p className="text-neutral-600 mt-1">
          {total} {total === 1 ? "usuario" : "usuarios"} en total
        </p>
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
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={role}
            onChange={(e) => updateParams({ role: e.target.value })}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
          >
            {roleFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Banned Filter */}
        <select
          value={banned}
          onChange={(e) => updateParams({ banned: e.target.value })}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
        >
          <option value="">Todos</option>
          <option value="true">Baneados</option>
          <option value="false">Activos</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando usuarios...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <User className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No hay usuarios para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Usuario</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Rol</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">Vehículos</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">Reportes</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Registro</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleInfo = roleConfig[user.role] || roleConfig.USER;
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr key={user.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/usuarios/${user.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-andino-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate hover:text-andino-600">
                              {user.name || "Sin nombre"}
                            </p>
                            <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleInfo.bg} ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-neutral-600">{user._count.vehicles}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-neutral-600">{user._count.reportsMade}</span>
                      </td>
                      <td className="px-4 py-3">
                        {user.bannedAt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            <Ban className="w-3 h-3" />
                            Baneado
                          </span>
                        ) : user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            Suspendido
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600">
                          {new Date(user.createdAt).toLocaleDateString("es-CL")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                              disabled={actionLoading === user.id}
                              className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenu === user.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                                <Link
                                  href={`/admin/usuarios/${user.id}`}
                                  className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                                >
                                  Ver detalles
                                </Link>
                                <hr className="my-1 border-neutral-100" />
                                {user.bannedAt ? (
                                  <button
                                    onClick={() => handleAction(user.id, "unban")}
                                    className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                                  >
                                    Quitar baneo
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleSuspend(user.id)}
                                      className="w-full px-4 py-2 text-sm text-left text-amber-600 hover:bg-amber-50"
                                    >
                                      Suspender
                                    </button>
                                    <button
                                      onClick={() => handleBan(user.id)}
                                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                    >
                                      Banear
                                    </button>
                                  </>
                                )}
                                <hr className="my-1 border-neutral-100" />
                                <button
                                  onClick={() => handleChangeRole(user.id)}
                                  className="w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50"
                                >
                                  Cambiar rol
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
