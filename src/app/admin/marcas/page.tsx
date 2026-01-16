"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BrandTable } from "@/components/admin/BrandTable";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  _count: {
    models: number;
    vehicles: number;
  };
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/marcas?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Marcas</h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "marca" : "marcas"} en total
          </p>
        </div>
        <Link
          href="/admin/marcas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700"
        >
          <Plus className="w-4 h-4" />
          Nueva marca
        </Link>
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
              placeholder="Buscar marca..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando marcas...</p>
        </div>
      ) : (
        <BrandTable brands={brands} onRefresh={fetchBrands} />
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
