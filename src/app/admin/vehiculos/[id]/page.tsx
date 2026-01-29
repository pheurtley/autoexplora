"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Eye,
  Star,
  Flag,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2,
  User,
  Calendar,
  MapPin,
  Gauge,
  Fuel,
  Settings2,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

interface Vehicle {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  year: number;
  mileage: number;
  vehicleType: string;
  category: string;
  condition: string;
  fuelType: string;
  transmission: string;
  color: string | null;
  doors: number | null;
  status: string;
  featured: boolean;
  views: number;
  contactPhone: string;
  contactWhatsApp: string | null;
  rejectionReason: string | null;
  createdAt: string;
  publishedAt: string;
  moderatedAt: string | null;
  brand: { id: string; name: string };
  model: { id: string; name: string };
  region: { id: string; name: string };
  comuna: { id: string; name: string } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    createdAt: string;
    bannedAt: string | null;
    _count: { vehicles: number };
  };
  images: { id: string; url: string; isPrimary: boolean }[];
  moderatedBy: { id: string; name: string | null; email: string | null } | null;
  reports: Array<{
    id: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: string;
    reporter: { id: string; name: string | null; email: string | null };
  }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Borrador", color: "text-neutral-700", bg: "bg-neutral-100" },
  ACTIVE: { label: "Activo", color: "text-green-700", bg: "bg-green-100" },
  PAUSED: { label: "Pausado", color: "text-amber-700", bg: "bg-amber-100" },
  SOLD: { label: "Vendido", color: "text-blue-700", bg: "bg-blue-100" },
  EXPIRED: { label: "Expirado", color: "text-neutral-700", bg: "bg-neutral-100" },
  REJECTED: { label: "Rechazado", color: "text-red-700", bg: "bg-red-100" },
};

const reportReasonLabels: Record<string, string> = {
  FRAUD: "Fraude / Estafa",
  INAPPROPRIATE: "Contenido inapropiado",
  DUPLICATE: "Duplicado",
  WRONG_INFO: "Información incorrecta",
  SOLD: "Ya vendido",
  OTHER: "Otro",
};

export default function AdminVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/admin/vehiculos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data);
      } else if (response.status === 404) {
        router.push("/admin/vehiculos");
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, reason?: string) => {
    if (!vehicle) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/vehiculos/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        fetchVehicle();
      } else {
        const data = await response.json();
        alert(data.error || "Error al realizar la acción");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al realizar la acción");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    const reason = prompt("Ingresa la razón del rechazo:");
    if (reason) {
      handleAction("reject", reason);
    }
  };

  const handleDelete = async () => {
    if (!vehicle) return;
    if (!confirm("¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer.")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/vehiculos/${vehicle.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/vehiculos");
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar el vehículo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el vehículo");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Vehículo no encontrado</p>
      </div>
    );
  }

  const status = statusConfig[vehicle.status] || statusConfig.DRAFT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/vehiculos"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a vehículos
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">
            {vehicle.brand.name} {vehicle.model.name} {vehicle.year}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            {vehicle.featured && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-700" />
                Destacado
              </span>
            )}
            {vehicle.reports.length > 0 && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                <Flag className="h-3.5 w-3.5" />
                {vehicle.reports.length} reportes
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/vehiculo/${vehicle.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
        >
          <Eye className="h-4 w-4" />
          Ver publicación
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-neutral-200">
        {vehicle.status !== "ACTIVE" && (
          <button
            onClick={() => handleAction("approve")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Aprobar
          </button>
        )}
        {vehicle.status !== "REJECTED" && (
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Rechazar
          </button>
        )}
        {vehicle.status === "ACTIVE" && (
          <button
            onClick={() => handleAction("pause")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50"
          >
            <Pause className="h-4 w-4" />
            Pausar
          </button>
        )}
        {vehicle.status === "PAUSED" && (
          <button
            onClick={() => handleAction("unpause")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Reactivar
          </button>
        )}
        {vehicle.featured ? (
          <button
            onClick={() => handleAction("unfeature")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
          >
            <Star className="h-4 w-4" />
            Quitar destacado
          </button>
        ) : (
          <button
            onClick={() => handleAction("feature")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50"
          >
            <Star className="h-4 w-4 fill-amber-700" />
            Destacar
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 ml-auto"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>

      {/* Rejection Reason */}
      {vehicle.rejectionReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-800">Razón del rechazo:</p>
          <p className="text-sm text-red-700 mt-1">{vehicle.rejectionReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Imágenes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vehicle.images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100"
                >
                  <Image
                    src={image.url}
                    alt={vehicle.title}
                    fill
                    className="object-cover"
                  />
                  {image.isPrimary && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-andino-600 text-white rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">
              Detalles del vehículo
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Año</p>
                  <p className="font-medium text-neutral-900">{vehicle.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Gauge className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Kilometraje</p>
                  <p className="font-medium text-neutral-900">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Fuel className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Combustible</p>
                  <p className="font-medium text-neutral-900">
                    {vehicle.fuelType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Settings2 className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Transmisión</p>
                  <p className="font-medium text-neutral-900">
                    {vehicle.transmission}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Ubicación</p>
                  <p className="font-medium text-neutral-900">
                    {vehicle.region.name}
                    {vehicle.comuna && `, ${vehicle.comuna.name}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Eye className="h-4 w-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Vistas</p>
                  <p className="font-medium text-neutral-900">{vehicle.views}</p>
                </div>
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-6 pt-4 border-t border-neutral-100">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Descripción
                </p>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          {/* Reports */}
          {vehicle.reports.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-600" />
                Reportes ({vehicle.reports.length})
              </h2>
              <div className="space-y-3">
                {vehicle.reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-medium text-neutral-900">
                          {reportReasonLabels[report.reason] || report.reason}
                        </span>
                        {report.description && (
                          <p className="text-sm text-neutral-600 mt-1">
                            {report.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          report.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : report.status === "RESOLVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <span>
                        Reportado por{" "}
                        {report.reporter.name || report.reporter.email}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Precio</p>
            <p className="text-2xl font-bold text-andino-700">
              {formatPrice(vehicle.price)}
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Vendedor</h2>
            <Link
              href={`/admin/usuarios/${vehicle.user.id}`}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
                <User className="w-5 h-5 text-andino-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900 truncate">
                  {vehicle.user.name || "Sin nombre"}
                </p>
                <p className="text-sm text-neutral-500 truncate">
                  {vehicle.user.email}
                </p>
              </div>
            </Link>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="h-4 w-4" />
                {vehicle.contactPhone}
              </div>
              {vehicle.contactWhatsApp && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="h-4 w-4" />
                  {vehicle.contactWhatsApp}
                </div>
              )}
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock className="h-4 w-4" />
                Registrado:{" "}
                {new Date(vehicle.user.createdAt).toLocaleDateString("es-CL")}
              </div>
              <p className="text-neutral-500">
                {vehicle.user._count.vehicles} publicaciones
              </p>
              {vehicle.user.bannedAt && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Usuario baneado
                </span>
              )}
            </div>
          </div>

          {/* Moderation Info */}
          {vehicle.moderatedBy && (
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h2 className="font-semibold text-neutral-900 mb-4">
                Última moderación
              </h2>
              <div className="text-sm text-neutral-600">
                <p>
                  Por: {vehicle.moderatedBy.name || vehicle.moderatedBy.email}
                </p>
                {vehicle.moderatedAt && (
                  <p className="mt-1">
                    {new Date(vehicle.moderatedAt).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Fechas</h2>
            <div className="space-y-2 text-sm text-neutral-600">
              <p>
                <span className="text-neutral-500">Creado:</span>{" "}
                {new Date(vehicle.createdAt).toLocaleDateString("es-CL")}
              </p>
              <p>
                <span className="text-neutral-500">Publicado:</span>{" "}
                {new Date(vehicle.publishedAt).toLocaleDateString("es-CL")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
