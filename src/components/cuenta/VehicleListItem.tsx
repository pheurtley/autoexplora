"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import {
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";

interface VehicleListItemProps {
  vehicle: {
    id: string;
    slug: string;
    title: string;
    price: number;
    year: number;
    status: string;
    views: number;
    publishedAt: Date;
    brand: { name: string };
    model: { name: string };
    region: { name: string };
    images: { url: string }[];
  };
  onStatusChange?: (id: string, status: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  ACTIVE: { label: "Activo", variant: "success" },
  PAUSED: { label: "Pausado", variant: "warning" },
  SOLD: { label: "Vendido", variant: "default" },
  EXPIRED: { label: "Expirado", variant: "error" },
  DRAFT: { label: "Borrador", variant: "default" },
};

export function VehicleListItem({
  vehicle,
  onStatusChange,
  onDelete,
}: VehicleListItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusConfig = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.DRAFT;
  const primaryImage = vehicle.images[0]?.url;

  const handleToggleStatus = async () => {
    if (!onStatusChange) return;
    setIsLoading(true);
    const newStatus = vehicle.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await onStatusChange(vehicle.id, newStatus);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    await onDelete(vehicle.id);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-36 sm:h-auto bg-neutral-100 shrink-0">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={vehicle.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusConfig.variant} size="sm">
                  {statusConfig.label}
                </Badge>
              </div>
              <h3 className="font-semibold text-neutral-900 line-clamp-1">
                {vehicle.title}
              </h3>
              <p className="text-lg font-bold text-andino-700 mt-1">
                {formatPrice(vehicle.price)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {vehicle.region.name}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {vehicle.views} visitas
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
            <Link href={`/vehiculos/${vehicle.slug}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
            </Link>
            <Link href={`/cuenta/publicaciones/${vehicle.id}/editar`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </Link>
            {(vehicle.status === "ACTIVE" || vehicle.status === "PAUSED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : vehicle.status === "ACTIVE" ? (
                  <Pause className="w-4 h-4 mr-1" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                {vehicle.status === "ACTIVE" ? "Pausar" : "Activar"}
              </Button>
            )}
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">¿Confirmar?</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-red-600 hover:bg-red-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Sí"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
