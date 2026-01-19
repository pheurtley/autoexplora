"use client";

import Image from "next/image";
import type { PublishFormData } from "@/lib/validations";
import { formatPrice, formatKilometers } from "@/lib/utils";
import { VEHICLE_CATEGORIES, FUEL_TYPES, TRANSMISSIONS, CONDITIONS, COLORS } from "@/lib/constants";
import {
  Car,
  Bike,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  DoorOpen,
  CheckCircle,
} from "lucide-react";

interface Step7PreviewProps {
  data: PublishFormData;
  brandName: string;
  modelName: string;
  regionName: string;
  comunaName: string;
}

const VEHICLE_TYPE_ICONS = {
  AUTO: Car,
  MOTO: Bike,
  COMERCIAL: Truck,
};

const VEHICLE_TYPE_LABELS = {
  AUTO: "Auto",
  MOTO: "Moto",
  COMERCIAL: "Comercial",
};

export function Step7Preview({
  data,
  brandName,
  modelName,
  regionName,
  comunaName,
}: Step7PreviewProps) {
  const VehicleTypeIcon = VEHICLE_TYPE_ICONS[data.vehicleType as keyof typeof VEHICLE_TYPE_ICONS] || Car;
  const primaryImage = data.images.find((img) => img.isPrimary) || data.images[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Revisa tu publicación</p>
          <p className="text-sm text-green-700">Verifica que todos los datos sean correctos antes de publicar.</p>
        </div>
      </div>

      {/* Vehicle Card Preview */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video bg-neutral-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={data.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <Settings2 className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 bg-andino-600 text-white text-xs font-medium rounded">
              {VEHICLE_TYPE_LABELS[data.vehicleType as keyof typeof VEHICLE_TYPE_LABELS]}
            </span>
            <span className="px-2 py-1 bg-neutral-800 text-white text-xs font-medium rounded">
              {VEHICLE_CATEGORIES[data.category as keyof typeof VEHICLE_CATEGORIES]?.label}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-sm rounded">
            {data.images.length} fotos
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <h3 className="text-xl font-bold text-neutral-900">{data.title}</h3>
          <p className="text-2xl font-bold text-andino-600 mt-1">
            {formatPrice(data.price)}
            {data.negotiable && (
              <span className="text-sm font-normal text-neutral-500 ml-2">
                (Negociable)
              </span>
            )}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <VehicleTypeIcon className="w-4 h-4 text-neutral-400" />
              <span>{brandName} {modelName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>{data.year}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Gauge className="w-4 h-4 text-neutral-400" />
              <span>{formatKilometers(data.mileage || 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Fuel className="w-4 h-4 text-neutral-400" />
              <span>{FUEL_TYPES[data.fuelType as keyof typeof FUEL_TYPES]?.label}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-3">
            <MapPin className="w-4 h-4" />
            <span>{comunaName ? `${comunaName}, ${regionName}` : regionName}</span>
          </div>
        </div>
      </div>

      {/* Details Summary */}
      <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 space-y-4">
        <h4 className="font-semibold text-neutral-900">Resumen de la publicación</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Vehicle Info */}
          <div className="space-y-2">
            <p className="font-medium text-neutral-700">Vehículo</p>
            <ul className="space-y-1 text-neutral-600">
              <li>Tipo: {VEHICLE_TYPE_LABELS[data.vehicleType as keyof typeof VEHICLE_TYPE_LABELS]}</li>
              <li>Categoría: {VEHICLE_CATEGORIES[data.category as keyof typeof VEHICLE_CATEGORIES]?.label}</li>
              <li>Marca: {brandName}</li>
              <li>Modelo: {modelName}</li>
              <li>Año: {data.year}</li>
              <li>Condición: {CONDITIONS[data.condition as keyof typeof CONDITIONS]?.label}</li>
              <li>Kilometraje: {formatKilometers(data.mileage || 0)}</li>
            </ul>
          </div>

          {/* Specs */}
          <div className="space-y-2">
            <p className="font-medium text-neutral-700">Especificaciones</p>
            <ul className="space-y-1 text-neutral-600">
              <li>Combustible: {FUEL_TYPES[data.fuelType as keyof typeof FUEL_TYPES]?.label}</li>
              <li>Transmisión: {TRANSMISSIONS[data.transmission as keyof typeof TRANSMISSIONS]?.label}</li>
              {data.color && <li>Color: {COLORS[data.color as keyof typeof COLORS]?.label || data.color}</li>}
              {data.doors && <li>Puertas: {data.doors}</li>}
              {data.engineSize && <li>Motor: {data.engineSize}</li>}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="font-medium text-neutral-700">Contacto</p>
            <ul className="space-y-1 text-neutral-600">
              <li className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {data.contactPhone} {data.showPhone ? "(Visible)" : "(Oculto)"}
              </li>
              {data.contactWhatsApp && (
                <li className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {data.contactWhatsApp}
                </li>
              )}
            </ul>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <p className="font-medium text-neutral-700">Imágenes</p>
            <p className="text-neutral-600">{data.images.length} fotos cargadas</p>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="font-medium text-neutral-700 mb-2">Descripción</p>
            <p className="text-neutral-600 text-sm whitespace-pre-line">{data.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
