"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui";
import { formatRut } from "@/lib/rut";

interface DealerDetail {
  id: string;
  slug: string;
  tradeName: string;
  businessName: string;
  rut: string;
  type: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  website: string | null;
  address: string;
  logo: string | null;
  banner: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  region: { name: string };
  comuna: { name: string } | null;
  users: {
    id: string;
    name: string | null;
    email: string | null;
    dealerRole: string;
    createdAt: string;
  }[];
  vehicles: {
    id: string;
    title: string;
    slug: string;
    status: string;
    price: number;
    createdAt: string;
  }[];
  _count: {
    vehicles: number;
    users: number;
  };
}

const statusConfig = {
  PENDING: { label: "Pendiente de aprobación", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  ACTIVE: { label: "Activo", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  SUSPENDED: { label: "Suspendido", color: "text-red-700", bg: "bg-red-100", icon: Ban },
  REJECTED: { label: "Rechazado", color: "text-neutral-700", bg: "bg-neutral-100", icon: XCircle },
};

const typeLabels: Record<string, string> = {
  AUTOMOTORA: "Automotora",
  RENT_A_CAR: "Rent a Car",
};

const roleLabels: Record<string, string> = {
  OWNER: "Propietario",
  MANAGER: "Gerente",
  SALES: "Vendedor",
};

export default function AdminDealerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [dealer, setDealer] = useState<DealerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDealer();
  }, [id]);

  const fetchDealer = async () => {
    try {
      const response = await fetch(`/api/admin/dealers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDealer(data.dealer);
      } else if (response.status === 404) {
        router.push("/admin/automotoras");
      }
    } catch (error) {
      console.error("Error fetching dealer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    if (!dealer) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason }),
      });

      if (response.ok) {
        fetchDealer();
      } else {
        const result = await response.json();
        alert(result.error || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el estado");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => {
    if (confirm("¿Aprobar esta automotora?")) {
      handleStatusChange("ACTIVE");
    }
  };

  const handleReject = () => {
    const reason = prompt("Razón del rechazo:");
    if (reason) {
      handleStatusChange("REJECTED", reason);
    }
  };

  const handleSuspend = () => {
    const reason = prompt("Razón de la suspensión:");
    if (reason) {
      handleStatusChange("SUSPENDED", reason);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Automotora no encontrada</p>
        <Link href="/admin/automotoras" className="text-andino-600 hover:underline mt-4 block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[dealer.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/automotoras"
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">{dealer.tradeName}</h1>
          <p className="text-neutral-600">{dealer.businessName} - {formatRut(dealer.rut)}</p>
        </div>
      </div>

      {/* Status Banner */}
      {dealer.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Pendiente de aprobación</h3>
            <p className="text-sm text-amber-700 mt-1">
              Esta automotora está esperando ser revisada y aprobada.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApprove} disabled={actionLoading} size="sm">
              Aprobar
            </Button>
            <Button onClick={handleReject} disabled={actionLoading} variant="danger" size="sm">
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {dealer.status === "ACTIVE" && (
        <div className="flex justify-end">
          <Button onClick={handleSuspend} disabled={actionLoading} variant="outline" size="sm">
            <Ban className="w-4 h-4 mr-2" />
            Suspender
          </Button>
        </div>
      )}

      {(dealer.status === "SUSPENDED" || dealer.status === "REJECTED") && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-start gap-4">
          <StatusIcon className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-neutral-800">{statusInfo.label}</h3>
            {dealer.rejectionReason && (
              <p className="text-sm text-neutral-600 mt-1">
                Razón: {dealer.rejectionReason}
              </p>
            )}
          </div>
          <Button onClick={handleApprove} disabled={actionLoading} size="sm">
            Reactivar
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Información del Negocio</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-500">Tipo de Negocio</label>
                <p className="mt-1 text-neutral-900">{typeLabels[dealer.type] || dealer.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Estado</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Razón Social</label>
                <p className="mt-1 text-neutral-900">{dealer.businessName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">RUT</label>
                <p className="mt-1 text-neutral-900">{formatRut(dealer.rut)}</p>
              </div>
            </div>

            {dealer.description && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <label className="text-sm font-medium text-neutral-500">Descripción</label>
                <p className="mt-1 text-neutral-700 whitespace-pre-line">{dealer.description}</p>
              </div>
            )}
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contacto y Ubicación</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-700">
                  {dealer.address}, {dealer.comuna?.name && `${dealer.comuna.name}, `}{dealer.region.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-400" />
                <a href={`mailto:${dealer.email}`} className="text-andino-600 hover:underline">
                  {dealer.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-700">{dealer.phone}</span>
              </div>
              {dealer.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-neutral-400" />
                  <a
                    href={dealer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-andino-600 hover:underline flex items-center gap-1"
                  >
                    {dealer.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Equipo ({dealer.users.length})
            </h2>

            <div className="space-y-3">
              {dealer.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-andino-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-andino-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{user.name || "Sin nombre"}</p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-600">
                    {roleLabels[user.dealerRole] || user.dealerRole}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Vehicles */}
          {dealer.vehicles.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Vehículos Recientes
              </h2>

              <div className="space-y-2">
                {dealer.vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/admin/vehiculos/${vehicle.id}`}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Car className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-900">{vehicle.title}</span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      ${vehicle.price.toLocaleString("es-CL")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="w-32 h-32 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden">
              {dealer.logo ? (
                <img src={dealer.logo} alt={dealer.tradeName} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-12 h-12 text-neutral-400" />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-600">
                <Car className="w-4 h-4" />
                <span>Vehículos</span>
              </div>
              <span className="font-semibold text-neutral-900">{dealer._count.vehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-600">
                <Users className="w-4 h-4" />
                <span>Usuarios</span>
              </div>
              <span className="font-semibold text-neutral-900">{dealer._count.users}</span>
            </div>
            <hr className="border-neutral-200" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-4 h-4" />
                <span>Registro</span>
              </div>
              <span className="text-sm text-neutral-900">
                {new Date(dealer.createdAt).toLocaleDateString("es-CL")}
              </span>
            </div>
            {dealer.verifiedAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Aprobado</span>
                </div>
                <span className="text-sm text-neutral-900">
                  {new Date(dealer.verifiedAt).toLocaleDateString("es-CL")}
                </span>
              </div>
            )}
          </div>

          {/* Microsite Management */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-medium text-neutral-900 mb-3">Micrositio</h3>
            <Link
              href={`/admin/automotoras/${dealer.id}/microsite`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-andino-50 text-andino-700 hover:bg-andino-100 rounded-lg text-sm font-medium transition-colors w-full justify-center"
            >
              <Globe className="w-4 h-4" />
              Configurar Micrositio
            </Link>
          </div>

          {/* Public Link */}
          {dealer.status === "ACTIVE" && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900 mb-2">Perfil Público</h3>
              <Link
                href={`/automotora/${dealer.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-andino-600 hover:underline text-sm flex items-center gap-1"
              >
                Ver página pública
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
