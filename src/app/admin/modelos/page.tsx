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
  Tag,
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
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    versions: number;
    vehicles: number;
  };
}

export default function AdminModelsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [models, setModels] = useState<Model[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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

  // Fetch brands for filter
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/admin/marcas?limit=500");
        if (response.ok) {
          const data = await response.json();
          setBrands(data.brands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }
    fetchBrands();
  }, []);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (brandId) params.set("brandId", brandId);

      const response = await fetch(`/api/admin/modelos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, brandId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if ("search" in updates || "brandId" in updates) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleDelete = async (model: Model) => {
    if (model._count.vehicles > 0) {
      alert(
        `No se puede eliminar "${model.name}" porque tiene ${model._count.vehicles} vehículo(s) asociado(s)`
      );
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de eliminar el modelo "${model.name}"? Esta acción eliminará también todas sus versiones.`
      )
    ) {
      return;
    }

    setDeleting(model.id);
    try {
      const response = await fetch(`/api/admin/modelos/${model.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchModels();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar el modelo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el modelo");
    } finally {
      setDeleting(null);
    }
  };

  const selectedBrand = brands.find((b) => b.id === brandId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Modelos</h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "modelo" : "modelos"}
            {selectedBrand ? ` de ${selectedBrand.name}` : " en total"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
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
          {brandId && (
            <button
              onClick={() => updateParams({ brandId: "" })}
              className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
              title="Limpiar filtro"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(search || brandId) && (
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
                onClick={() => updateParams({ brandId: "" })}
                className="hover:text-purple-900"
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
          <p className="text-neutral-500 mt-4">Cargando modelos...</p>
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500">No hay modelos para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Marca
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                    Slug
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                    Versiones
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
                {models.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-900">
                        {model.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/marcas/${model.brand.id}`}
                        className="text-andino-600 hover:underline"
                      >
                        {model.brand.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-500 font-mono">
                        {model.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/versiones?modelId=${model.id}`}
                        className="inline-flex items-center gap-1 text-sm text-andino-600 hover:underline"
                      >
                        <Tag className="w-4 h-4" />
                        {model._count.versions}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                        <Car className="w-4 h-4" />
                        {model._count.vehicles}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/marcas/${model.brand.id}`}
                          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                          title="Ver en marca"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(model)}
                          disabled={
                            model._count.vehicles > 0 || deleting === model.id
                          }
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            model._count.vehicles > 0
                              ? "No se puede eliminar porque tiene vehículos asociados"
                              : "Eliminar modelo"
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
