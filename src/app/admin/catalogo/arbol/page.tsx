"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronDown,
  Tag,
  Layers,
  Tags,
  Car,
  Search,
  ArrowLeft,
} from "lucide-react";

interface Version {
  id: string;
  name: string;
  _count: { vehicles: number };
}

interface Model {
  id: string;
  name: string;
  versions: Version[];
  _count: { vehicles: number; versions: number };
}

interface Brand {
  id: string;
  name: string;
  logo: string | null;
  models: Model[];
  _count: { models: number; vehicles: number };
}

export default function CatalogTreePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCatalog() {
      try {
        // Fetch all brands with models and versions
        const response = await fetch("/api/admin/marcas?limit=500");
        if (response.ok) {
          const data = await response.json();
          // For each brand, fetch its details including models and versions
          const brandsWithDetails = await Promise.all(
            data.brands.map(async (brand: Brand) => {
              const detailRes = await fetch(`/api/admin/marcas/${brand.id}`);
              if (detailRes.ok) {
                return await detailRes.json();
              }
              return brand;
            })
          );
          setBrands(brandsWithDetails);
        }
      } catch (error) {
        console.error("Error fetching catalog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const toggleBrand = (brandId: string) => {
    setExpandedBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brandId)) {
        newSet.delete(brandId);
      } else {
        newSet.add(brandId);
      }
      return newSet;
    });
  };

  const toggleModel = (modelId: string) => {
    setExpandedModels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedBrands(new Set(filteredBrands.map((b) => b.id)));
    const allModelIds = filteredBrands.flatMap((b) => b.models.map((m) => m.id));
    setExpandedModels(new Set(allModelIds));
  };

  const collapseAll = () => {
    setExpandedBrands(new Set());
    setExpandedModels(new Set());
  };

  // Filter brands based on search
  const filteredBrands = brands.filter((brand) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();

    // Check brand name
    if (brand.name.toLowerCase().includes(searchLower)) return true;

    // Check model names
    if (brand.models?.some((model) =>
      model.name.toLowerCase().includes(searchLower)
    )) return true;

    // Check version names
    if (brand.models?.some((model) =>
      model.versions?.some((version) =>
        version.name.toLowerCase().includes(searchLower)
      )
    )) return true;

    return false;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/catalogo"
            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Vista de Árbol</h1>
          <p className="text-neutral-600 mt-1">
            Explora la jerarquía completa del catálogo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            Expandir todo
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca, modelo o versión..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-neutral-600">
        <span className="flex items-center gap-1">
          <Tag className="w-4 h-4" />
          {filteredBrands.length} marcas
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-4 h-4" />
          {filteredBrands.reduce((sum, b) => sum + (b.models?.length || 0), 0)} modelos
        </span>
        <span className="flex items-center gap-1">
          <Tags className="w-4 h-4" />
          {filteredBrands.reduce(
            (sum, b) =>
              sum + (b.models?.reduce((mSum, m) => mSum + (m.versions?.length || 0), 0) || 0),
            0
          ).toLocaleString()}{" "}
          versiones
        </span>
      </div>

      {/* Tree */}
      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            No se encontraron resultados
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <div key={brand.id}>
              {/* Brand Level */}
              <div
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer"
                onClick={() => toggleBrand(brand.id)}
              >
                <button className="p-0.5">
                  {expandedBrands.has(brand.id) ? (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  )}
                </button>

                <div className="relative w-8 h-8 rounded bg-neutral-100 flex-shrink-0">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/marcas/${brand.id}`}
                    className="font-medium text-neutral-900 hover:text-andino-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {brand.name}
                  </Link>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {brand._count?.models || brand.models?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    {brand._count?.vehicles || 0}
                  </span>
                </div>
              </div>

              {/* Models Level */}
              {expandedBrands.has(brand.id) && brand.models && (
                <div className="bg-neutral-50">
                  {brand.models.map((model) => (
                    <div key={model.id}>
                      <div
                        className="flex items-center gap-3 px-4 py-2 pl-12 hover:bg-neutral-100 cursor-pointer"
                        onClick={() => toggleModel(model.id)}
                      >
                        <button className="p-0.5">
                          {model.versions && model.versions.length > 0 ? (
                            expandedModels.has(model.id) ? (
                              <ChevronDown className="w-4 h-4 text-neutral-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-neutral-400" />
                            )
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </button>

                        <Layers className="w-4 h-4 text-purple-500" />

                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-neutral-800">
                            {model.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Tags className="w-3.5 h-3.5" />
                            {model._count?.versions || model.versions?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5" />
                            {model._count?.vehicles || 0}
                          </span>
                        </div>
                      </div>

                      {/* Versions Level */}
                      {expandedModels.has(model.id) && model.versions && (
                        <div className="bg-neutral-100/50">
                          {model.versions.map((version) => (
                            <div
                              key={version.id}
                              className="flex items-center gap-3 px-4 py-1.5 pl-20 hover:bg-neutral-100"
                            >
                              <Tags className="w-3.5 h-3.5 text-amber-500" />

                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-neutral-700">
                                  {version.name}
                                </span>
                              </div>

                              <span className="flex items-center gap-1 text-xs text-neutral-400">
                                <Car className="w-3 h-3" />
                                {version._count?.vehicles || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
