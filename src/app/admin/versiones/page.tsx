"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Car,
  Filter,
  X,
} from "lucide-react";

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  brand: {
    id: string;
  };
}

interface Version {
  id: string;
  name: string;
  slug: string;
  engineSize: string | null;
  horsePower: number | null;
  transmission: string | null;
  drivetrain: string | null;
  trimLevel: string | null;
  model: {
    id: string;
    name: string;
    slug: string;
    brand: {
      id: string;
      name: string;
      slug: string;
    };
  };
  _count: {
    vehicles: number;
  };
}

export default function AdminVersionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [versions, setVersions] = useState<Version[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const brandId = searchParams.get("brandId") || "";
  const modelId = searchParams.get("modelId") || "";

  // Fetch brands and models for filters
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [brandsRes, modelsRes] = await Promise.all([
          fetch("/api/admin/marcas?limit=500"),
          fetch("/api/admin/modelos?limit=5000"),
        ]);

        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setBrands(data.brands);
        }

        if (modelsRes.ok) {
          const data = await modelsRes.json();
          setModels(data.models);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    }
    fetchFilters();
  }, []);

  // Filter models when brand changes
  useEffect(() => {
    if (brandId) {
      setFilteredModels(models.filter((m) => m.brand.id === brandId));
    } else {
      setFilteredModels(models);
    }
  }, [brandId, models]);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (modelId) params.set("modelId", modelId);

      const response = await fetch(`/api/admin/versiones?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Filter by brand client-side if needed (API doesn't have brandId filter)
        let filteredVersions = data.versions;
        if (brandId && !modelId) {
          filteredVersions = data.versions.filter(
            (v: Version) => v.model.brand.id === brandId
          );
        }
        setVersions(filteredVersions);
        setTotal(brandId && !modelId ? filteredVersions.length : data.total);
        setTotalPages(
          brandId && !modelId
            ? Math.ceil(filteredVersions.length / 20)
            : data.totalPages
        );
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, modelId, brandId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset dependent filters
    if ("brandId" in updates) {
      params.delete("modelId");
      params.delete("page");
    }
    if ("search" in updates || "modelId" in updates) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleDelete = async (version: Version) => {
    if (version._count.vehicles > 0) {
      alert(
        `No se puede eliminar "${version.name}" porque tiene ${version._count.vehicles} vehículo(s) asociado(s)`
      );
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la versión "${version.name}"?`)) {
      return;
    }

    setDeleting(version.id);
    try {
      const response = await fetch(`/api/admin/versiones/${version.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchVersions();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la versión");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la versión");
    } finally {
      setDeleting(null);
    }
  };

  const selectedBrand = brands.find((b) => b.id === brandId);
  const selectedModel = models.find((m) => m.id === modelId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Versiones</h1>
          <p className="text-neutral-600 mt-1">
            {total.toLocaleString()} {total === 1 ? "versión" : "versiones"}
            {selectedModel
              ? ` de ${selectedModel.name}`
              : selectedBrand
              ? ` de ${selectedBrand.name}`
              : " en total"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar versión..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-neutral-400" />

          <select
            value={brandId}
            onChange={(e) => updateParams({ brandId: e.target.value })}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <select
            value={modelId}
            onChange={(e) => updateParams({ modelId: e.target.value })}
            disabled={filteredModels.length === 0}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500 disabled:opacity-50"
          >
            <option value="">
              {brandId ? "Todos los modelos" : "Selecciona marca primero"}
            </option>
            {filteredModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>

          {(brandId || modelId) && (
            <button
              onClick={() => {
                updateParams({ brandId: "", modelId: "" });
              }}
              className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
              title="Limpiar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(search || brandId || modelId) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neutral-500">Filtros activos:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-andino-100 text-andino-700 text-sm rounded-lg">
              Búsqueda: {search}
              <button
                onClick={() => {
                  setSearchInput("");
                  updateParams({ search: "" });
                }}
                className="hover:text-andino-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg">
              Marca: {selectedBrand.name}
              <button
                onClick={() => updateParams({ brandId: "", modelId: "" })}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedModel && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-sm rounded-lg">
              Modelo: {selectedModel.name}
              <button
                onClick={() => updateParams({ modelId: "" })}
                className="hover:text-amber-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando versiones...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">No hay versiones para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Versión
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Modelo
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Marca
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Especificaciones
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                    Vehículos
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr
                    key={version.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-900">
                        {version.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updateParams({ modelId: version.model.id })
                        }
                        className="text-andino-600 hover:underline"
                      >
                        {version.model.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/marcas/${version.model.brand.id}`}
                        className="text-andino-600 hover:underline"
                      >
                        {version.model.brand.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {version.engineSize && (
                          <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                            {version.engineSize}
                          </span>
                        )}
                        {version.horsePower && (
                          <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                            {version.horsePower} HP
                          </span>
                        )}
                        {version.transmission && (
                          <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                            {version.transmission}
                          </span>
                        )}
                        {version.drivetrain && (
                          <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                            {version.drivetrain}
                          </span>
                        )}
                        {version.trimLevel && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            {version.trimLevel}
                          </span>
                        )}
                        {!version.engineSize &&
                          !version.horsePower &&
                          !version.transmission &&
                          !version.drivetrain &&
                          !version.trimLevel && (
                            <span className="text-xs text-neutral-400">
                              Sin especificaciones
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                        <Car className="w-4 h-4" />
                        {version._count.vehicles}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/marcas/${version.model.brand.id}`}
                          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                          title="Ver en marca"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(version)}
                          disabled={
                            version._count.vehicles > 0 ||
                            deleting === version.id
                          }
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            version._count.vehicles > 0
                              ? "No se puede eliminar porque tiene vehículos asociados"
                              : "Eliminar versión"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
