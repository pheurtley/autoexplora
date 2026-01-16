"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Flag,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  vehicle: {
    id: string;
    title: string;
    slug: string;
    status: string;
    brand: { name: string };
    model: { name: string };
    images: { url: string }[];
  };
  reporter: { id: string; name: string | null; email: string | null };
  resolvedBy: { id: string; name: string | null; email: string | null } | null;
}

const statusFilters = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "UNDER_REVIEW", label: "En revisión" },
  { value: "RESOLVED", label: "Resueltos" },
  { value: "DISMISSED", label: "Descartados" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pendiente", color: "text-amber-700", bg: "bg-amber-100" },
  UNDER_REVIEW: { label: "En revisión", color: "text-blue-700", bg: "bg-blue-100" },
  RESOLVED: { label: "Resuelto", color: "text-green-700", bg: "bg-green-100" },
  DISMISSED: { label: "Descartado", color: "text-neutral-700", bg: "bg-neutral-100" },
};

const reasonLabels: Record<string, string> = {
  FRAUD: "Fraude / Estafa",
  INAPPROPRIATE: "Contenido inapropiado",
  DUPLICATE: "Duplicado",
  WRONG_INFO: "Información incorrecta",
  SOLD: "Ya vendido",
  OTHER: "Otro",
};

export default function AdminReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (status) params.set("status", status);

      const response = await fetch(`/api/admin/reportes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if ("status" in updates) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = async (
    reportId: string,
    newStatus: string,
    resolution?: string
  ) => {
    setActionLoading(reportId);
    try {
      const response = await fetch(`/api/admin/reportes/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resolution }),
      });

      if (response.ok) {
        fetchReports();
      } else {
        const data = await response.json();
        alert(data.error || "Error al actualizar el reporte");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el reporte");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = (reportId: string) => {
    const resolution = prompt("Resolución (opcional):");
    handleStatusChange(reportId, "RESOLVED", resolution || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reportes</h1>
        <p className="text-neutral-600 mt-1">
          {total} {total === 1 ? "reporte" : "reportes"} en total
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
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

      {/* Reports List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Cargando reportes...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Flag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No hay reportes para mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportStatus = statusConfig[report.status] || statusConfig.PENDING;
            const primaryImage = report.vehicle.images[0]?.url;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-neutral-200 p-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Vehicle Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={report.vehicle.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/vehiculos/${report.vehicle.id}`}
                        className="font-medium text-neutral-900 hover:text-andino-600"
                      >
                        {report.vehicle.brand.name} {report.vehicle.model.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${reportStatus.bg} ${reportStatus.color}`}
                        >
                          {reportStatus.label}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {reasonLabels[report.reason] || report.reason}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                        <span>
                          Reportado por{" "}
                          <Link
                            href={`/admin/usuarios/${report.reporter.id}`}
                            className="text-andino-600 hover:underline"
                          >
                            {report.reporter.name || report.reporter.email}
                          </Link>
                        </span>
                        <span>
                          {new Date(report.createdAt).toLocaleDateString("es-CL")}
                        </span>
                      </div>
                      {report.resolution && (
                        <div className="mt-2 p-2 bg-neutral-50 rounded text-sm text-neutral-600">
                          <span className="font-medium">Resolución:</span>{" "}
                          {report.resolution}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 sm:items-end">
                    <Link
                      href={`/vehiculo/${report.vehicle.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                    {report.status === "PENDING" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(report.id, "UNDER_REVIEW")
                          }
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                        >
                          <Clock className="h-4 w-4" />
                          Revisar
                        </button>
                        <button
                          onClick={() => handleResolve(report.id)}
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolver
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(report.id, "DISMISSED")
                          }
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Descartar
                        </button>
                      </>
                    )}
                    {report.status === "UNDER_REVIEW" && (
                      <>
                        <button
                          onClick={() => handleResolve(report.id)}
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolver
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(report.id, "DISMISSED")
                          }
                          disabled={actionLoading === report.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Descartar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
