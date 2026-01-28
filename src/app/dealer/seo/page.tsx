"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  FileText,
  Tag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui";

interface VehicleSeoData {
  id: string;
  slug: string;
  title: string;
  year: number;
  brand: { name: string };
  model: { name: string };
  description: string | null;
  color: string | null;
  price: number;
  images: { url: string }[];
  status: string;
  seoScore: number;
  issues: string[];
  suggestions: string[];
}

interface SeoStats {
  totalVehicles: number;
  activeVehicles: number;
  avgSeoScore: number;
  excellentCount: number;
  goodCount: number;
  needsWorkCount: number;
  poorCount: number;
  commonIssues: { issue: string; count: number }[];
}

function calculateSeoScore(vehicle: {
  title: string;
  description: string | null;
  images: { url: string }[];
  price: number;
  color: string | null;
  brand: { name: string };
  model: { name: string };
  year: number;
}): { score: number; issues: string[]; suggestions: string[] } {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Title (20 points)
  if (vehicle.title && vehicle.title.length >= 20) {
    score += 20;
  } else if (vehicle.title && vehicle.title.length >= 10) {
    score += 10;
    issues.push("Titulo corto - menos de 20 caracteres");
    suggestions.push(`Agrega mas detalles al titulo como "${vehicle.year} ${vehicle.brand.name} ${vehicle.model.name} ${vehicle.color || ''} - Version/Motor"`);
  } else {
    issues.push("Titulo muy corto o vacio");
    suggestions.push("Un titulo descriptivo mejora el CTR en buscadores");
  }

  // Description (25 points)
  if (vehicle.description && vehicle.description.length >= 200) {
    score += 25;
  } else if (vehicle.description && vehicle.description.length >= 100) {
    score += 15;
    issues.push("Descripcion corta - menos de 200 caracteres");
    suggestions.push("Describe caracteristicas, historial, equipamiento y estado del vehiculo");
  } else if (vehicle.description && vehicle.description.length > 0) {
    score += 5;
    issues.push("Descripcion muy corta");
    suggestions.push("Una descripcion de al menos 200 caracteres mejora el posicionamiento");
  } else {
    issues.push("Sin descripcion");
    suggestions.push("Agrega una descripcion detallada del vehiculo");
  }

  // Images (30 points)
  const imageCount = vehicle.images.length;
  if (imageCount >= 10) {
    score += 30;
  } else if (imageCount >= 5) {
    score += 20;
    issues.push(`Solo ${imageCount} imagenes - recomendado minimo 10`);
    suggestions.push("Mas fotos aumentan el interes y confianza del comprador");
  } else if (imageCount >= 3) {
    score += 10;
    issues.push(`Pocas imagenes (${imageCount})`);
    suggestions.push("Agrega fotos del interior, motor, llantas y detalles");
  } else {
    issues.push("Muy pocas imagenes");
    suggestions.push("Minimo 3 fotos, recomendado 10+ para mejor visibilidad");
  }

  // Price (10 points)
  if (vehicle.price > 0) {
    score += 10;
  } else {
    issues.push("Sin precio definido");
    suggestions.push("Los vehiculos con precio aparecen en Google Shopping");
  }

  // Color (5 points)
  if (vehicle.color) {
    score += 5;
  } else {
    issues.push("Color no especificado");
    suggestions.push("El color ayuda en busquedas especificas");
  }

  // Brand and Model (10 points - usually always present)
  if (vehicle.brand?.name && vehicle.model?.name) {
    score += 10;
  }

  return { score, issues, suggestions };
}

function ScoreBadge({ score }: { score: number }) {
  let bgColor = "bg-red-100";
  let textColor = "text-red-700";
  let label = "Pobre";

  if (score >= 90) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
    label = "Excelente";
  } else if (score >= 70) {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
    label = "Bueno";
  } else if (score >= 50) {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
    label = "Mejorable";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {score}% - {label}
    </span>
  );
}

function GooglePreview({ vehicle }: { vehicle: VehicleSeoData }) {
  const title = `${vehicle.title} | AutoExplora.cl`;
  const description = vehicle.description
    ? vehicle.description.slice(0, 155) + (vehicle.description.length > 155 ? "..." : "")
    : `${vehicle.year} ${vehicle.brand.name} ${vehicle.model.name} en venta. Ver precio, fotos y especificaciones.`;
  const url = `autoexplora.cl/vehiculos/${vehicle.slug}`;

  return (
    <div className="p-4 bg-white rounded-lg border border-neutral-200">
      <p className="text-xs text-neutral-500 mb-1">Vista previa en Google:</p>
      <div className="font-sans">
        <p className="text-sm text-green-700 truncate">{url}</p>
        <p className="text-lg text-blue-700 hover:underline cursor-pointer truncate">
          {title.slice(0, 60)}{title.length > 60 ? "..." : ""}
        </p>
        <p className="text-sm text-neutral-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

function VehicleSeoCard({ vehicle, expanded, onToggle }: {
  vehicle: VehicleSeoData;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50"
        onClick={onToggle}
      >
        <div className="w-16 h-12 rounded bg-neutral-100 overflow-hidden flex-shrink-0">
          {vehicle.images[0]?.url ? (
            <img
              src={vehicle.images[0].url}
              alt={vehicle.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-neutral-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 truncate">{vehicle.title}</p>
          <p className="text-sm text-neutral-500">
            {vehicle.brand.name} {vehicle.model.name} {vehicle.year}
          </p>
        </div>
        <ScoreBadge score={vehicle.seoScore} />
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Issues */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Problemas detectados
              </h4>
              {vehicle.issues.length === 0 ? (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Sin problemas detectados
                </p>
              ) : (
                <ul className="space-y-1">
                  {vehicle.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Sugerencias
              </h4>
              {vehicle.suggestions.length === 0 ? (
                <p className="text-sm text-green-600">Publicacion optimizada</p>
              ) : (
                <ul className="space-y-1">
                  {vehicle.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Google Preview */}
          <div className="mt-4">
            <GooglePreview vehicle={vehicle} />
          </div>

          {/* Keywords */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-500" />
              Keywords sugeridas
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                `${vehicle.brand.name} ${vehicle.model.name}`,
                `${vehicle.brand.name} ${vehicle.model.name} ${vehicle.year}`,
                `${vehicle.brand.name} usado`,
                `comprar ${vehicle.brand.name}`,
                vehicle.color ? `${vehicle.brand.name} ${vehicle.color}` : null,
                `${vehicle.brand.name} precio`,
              ].filter(Boolean).map((keyword, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Link href={`/cuenta/publicaciones/${vehicle.id}/editar`}>
              <Button variant="outline" size="sm">
                Editar publicacion
              </Button>
            </Link>
            <Link href={`/vehiculos/${vehicle.slug}`} target="_blank">
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Ver publicacion
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DealerSeoPage() {
  const [vehicles, setVehicles] = useState<VehicleSeoData[]>([]);
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "issues">("all");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dealer/vehiculos?limit=100");
      if (response.ok) {
        const data = await response.json();

        // Calculate SEO scores for each vehicle
        const vehiclesWithSeo: VehicleSeoData[] = data.vehicles.map((v: VehicleSeoData) => {
          const { score, issues, suggestions } = calculateSeoScore(v);
          return { ...v, seoScore: score, issues, suggestions };
        });

        // Sort by score (lowest first to show problems)
        vehiclesWithSeo.sort((a, b) => a.seoScore - b.seoScore);

        setVehicles(vehiclesWithSeo);

        // Calculate stats
        const activeVehicles = vehiclesWithSeo.filter(v => v.status === "ACTIVE");
        const totalScore = activeVehicles.reduce((sum, v) => sum + v.seoScore, 0);
        const avgScore = activeVehicles.length > 0 ? Math.round(totalScore / activeVehicles.length) : 0;

        // Count by score range
        const excellentCount = activeVehicles.filter(v => v.seoScore >= 90).length;
        const goodCount = activeVehicles.filter(v => v.seoScore >= 70 && v.seoScore < 90).length;
        const needsWorkCount = activeVehicles.filter(v => v.seoScore >= 50 && v.seoScore < 70).length;
        const poorCount = activeVehicles.filter(v => v.seoScore < 50).length;

        // Common issues
        const issueCounts: Record<string, number> = {};
        activeVehicles.forEach(v => {
          v.issues.forEach(issue => {
            issueCounts[issue] = (issueCounts[issue] || 0) + 1;
          });
        });
        const commonIssues = Object.entries(issueCounts)
          .map(([issue, count]) => ({ issue, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalVehicles: data.vehicles.length,
          activeVehicles: activeVehicles.length,
          avgSeoScore: avgScore,
          excellentCount,
          goodCount,
          needsWorkCount,
          poorCount,
          commonIssues,
        });
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = filter === "issues"
    ? vehicles.filter(v => v.issues.length > 0)
    : vehicles;

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
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">SEO de Vehiculos</h1>
        <p className="text-neutral-600 mt-1">
          Optimiza tus publicaciones para aparecer mejor en Google
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Score Promedio</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.avgSeoScore}%</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Excelentes (90%+)</p>
            <p className="text-3xl font-bold text-green-600">{stats.excellentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Buenos (70-89%)</p>
            <p className="text-3xl font-bold text-blue-600">{stats.goodCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Mejorables (50-69%)</p>
            <p className="text-3xl font-bold text-amber-600">{stats.needsWorkCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Requieren atencion</p>
            <p className="text-3xl font-bold text-red-600">{stats.poorCount}</p>
          </div>
        </div>
      )}

      {/* Common Issues */}
      {stats && stats.commonIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Problemas mas comunes
          </h2>
          <div className="space-y-2">
            {stats.commonIssues.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-neutral-600">{item.issue}</span>
                <span className="text-sm font-medium text-neutral-900 bg-neutral-100 px-2 py-1 rounded">
                  {item.count} vehiculos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">Mostrar:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === "all"
                ? "bg-andino-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Todos ({vehicles.length})
          </button>
          <button
            onClick={() => setFilter("issues")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === "issues"
                ? "bg-andino-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Con problemas ({vehicles.filter(v => v.issues.length > 0).length})
          </button>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="space-y-3">
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-neutral-600">
              {filter === "issues"
                ? "Todos tus vehiculos estan optimizados!"
                : "No hay vehiculos para mostrar"}
            </p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleSeoCard
              key={vehicle.id}
              vehicle={vehicle}
              expanded={expandedId === vehicle.id}
              onToggle={() => setExpandedId(expandedId === vehicle.id ? null : vehicle.id)}
            />
          ))
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Tips para mejorar tu SEO
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Titulos descriptivos:</strong> Incluye año, marca, modelo, version y caracteristicas destacadas</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Descripciones completas:</strong> Minimo 200 caracteres describiendo estado, equipamiento e historial</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Muchas fotos:</strong> 10+ imagenes de calidad aumentan las vistas y el interes</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Precio visible:</strong> Los vehiculos con precio aparecen en Google Shopping</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Datos completos:</strong> Color, transmision, combustible y kilometraje ayudan en busquedas especificas</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
