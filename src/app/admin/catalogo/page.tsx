"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Layers,
  Tags,
  Car,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ImageIcon,
  Settings2,
  ChevronRight,
} from "lucide-react";

interface Stats {
  totals: {
    brands: number;
    models: number;
    versions: number;
    vehicles: number;
  };
  dataQuality: {
    brandsWithoutModels: number;
    modelsWithoutVersions: number;
    versionsWithoutVehicles: number;
    brandsWithLogos: number;
    brandsWithoutLogos: number;
    versionsWithMetadata: number;
    versionsWithoutMetadata: number;
  };
  topBrands: Array<{
    id: string;
    name: string;
    logo: string | null;
    _count: { vehicles: number; models: number };
  }>;
  topModels: Array<{
    id: string;
    name: string;
    brand: { id: string; name: string };
    _count: { vehicles: number; versions: number };
  }>;
}

export default function CatalogDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/catalogo/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Error al cargar estadísticas</p>
      </div>
    );
  }

  const dataQualityScore = Math.round(
    ((stats.dataQuality.brandsWithLogos / Math.max(stats.totals.brands, 1)) * 30 +
      (stats.dataQuality.versionsWithMetadata / Math.max(stats.totals.versions, 1)) * 40 +
      ((stats.totals.models - stats.dataQuality.modelsWithoutVersions) / Math.max(stats.totals.models, 1)) * 30)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard de Catálogo</h1>
          <p className="text-neutral-600 mt-1">
            Vista general del catálogo de vehículos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/catalogo/arbol"
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50"
          >
            <Layers className="w-4 h-4" />
            Vista Árbol
          </Link>
          <Link
            href="/admin/catalogo/importar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700"
          >
            <Settings2 className="w-4 h-4" />
            Importar/Exportar
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/marcas" className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totals.brands}</p>
              <p className="text-sm text-neutral-500">Marcas</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/modelos" className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totals.models}</p>
              <p className="text-sm text-neutral-500">Modelos</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/versiones" className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Tags className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totals.versions.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">Versiones</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/vehiculos" className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totals.vehicles}</p>
              <p className="text-sm text-neutral-500">Vehículos</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Data Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Calidad de Datos</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              dataQualityScore >= 80 ? "bg-green-100 text-green-700" :
              dataQualityScore >= 50 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {dataQualityScore}%
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {stats.dataQuality.brandsWithoutModels === 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm text-neutral-700">Marcas sin modelos</span>
              </div>
              <span className={`text-sm font-medium ${
                stats.dataQuality.brandsWithoutModels === 0 ? "text-green-600" : "text-amber-600"
              }`}>
                {stats.dataQuality.brandsWithoutModels}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {stats.dataQuality.modelsWithoutVersions === 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm text-neutral-700">Modelos sin versiones</span>
              </div>
              <span className={`text-sm font-medium ${
                stats.dataQuality.modelsWithoutVersions === 0 ? "text-green-600" : "text-amber-600"
              }`}>
                {stats.dataQuality.modelsWithoutVersions}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-700">Marcas con logo</span>
              </div>
              <span className="text-sm font-medium text-neutral-600">
                {stats.dataQuality.brandsWithLogos} / {stats.totals.brands}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-700">Versiones con metadata</span>
              </div>
              <span className="text-sm font-medium text-neutral-600">
                {stats.dataQuality.versionsWithMetadata.toLocaleString()} / {stats.totals.versions.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Top Marcas por Vehículos</h2>
            <TrendingUp className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {stats.topBrands.slice(0, 5).map((brand, index) => (
              <Link
                key={brand.id}
                href={`/admin/marcas/${brand.id}`}
                className="flex items-center gap-3 py-2 hover:bg-neutral-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-400 w-5">{index + 1}</span>
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
                  <p className="font-medium text-neutral-900 truncate">{brand.name}</p>
                  <p className="text-xs text-neutral-500">{brand._count.models} modelos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">{brand._count.vehicles}</p>
                  <p className="text-xs text-neutral-500">vehículos</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
