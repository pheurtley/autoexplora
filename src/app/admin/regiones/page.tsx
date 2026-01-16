"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RegionTable } from "@/components/admin/RegionTable";
import { Search, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Region {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count: {
    comunas: number;
    vehicles: number;
  };
}

export default function AdminRegionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [regions, setRegions] = useState<Region[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  // New region modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/regiones?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRegions(data.regions);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        // Set default order for new region
        if (data.regions.length > 0) {
          const maxOrder = Math.max(...data.regions.map((r: Region) => r.order));
          setNewOrder(maxOrder + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if ("search" in updates) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleCreateRegion = async () => {
    setError(null);
    if (!newName.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/regiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          order: newOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear la región");
        return;
      }

      setShowNewModal(false);
      setNewName("");
      router.push(`/admin/regiones/${data.id}`);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al crear la región");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Regiones</h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "región" : "regiones"} en total
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700"
        >
          <Plus className="w-4 h-4" />
          Nueva región
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar región..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando regiones...</p>
        </div>
      ) : (
        <RegionTable regions={regions} onRefresh={fetchRegions} />
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

      {/* New Region Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                Nueva región
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre de la región *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Región Metropolitana"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Orden de visualización *
                </label>
                <input
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={saving}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Las regiones se ordenan de menor a mayor
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewModal(false)}
                disabled={saving}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRegion}
                disabled={saving}
                className="px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear región"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
