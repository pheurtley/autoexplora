import { formatKilometers } from "@/lib/utils";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  VEHICLE_CATEGORIES,
  COLORS,
} from "@/lib/constants";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Car,
  Palette,
  Hash,
  DoorOpen,
  Users,
  Tag,
} from "lucide-react";

interface VehicleSpecsProps {
  vehicle: {
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    vehicleType: string;
    category: string;
    color: string | null;
    doors: number | null;
    seats: number | null;
    plateEnding: string | null;
    version?: { name: string } | null;
  };
}

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
  const fuelLabel =
    FUEL_TYPES[vehicle.fuelType as keyof typeof FUEL_TYPES]?.label ||
    vehicle.fuelType;
  const transmissionLabel =
    TRANSMISSIONS[vehicle.transmission as keyof typeof TRANSMISSIONS]?.label ||
    vehicle.transmission;
  const typeLabel =
    VEHICLE_TYPES[vehicle.vehicleType as keyof typeof VEHICLE_TYPES]?.label ||
    vehicle.vehicleType;
  const categoryLabel = vehicle.category
    ? VEHICLE_CATEGORIES[vehicle.category as keyof typeof VEHICLE_CATEGORIES]
        ?.label || vehicle.category
    : null;
  const colorLabel = vehicle.color
    ? COLORS[vehicle.color as keyof typeof COLORS]?.label || vehicle.color
    : null;

  const specs = [
    {
      icon: Calendar,
      label: "Año",
      value: vehicle.year.toString(),
    },
    {
      icon: Gauge,
      label: "Kilometraje",
      value: formatKilometers(vehicle.mileage),
    },
    {
      icon: Fuel,
      label: "Combustible",
      value: fuelLabel,
    },
    {
      icon: Settings2,
      label: "Transmisión",
      value: transmissionLabel,
    },
    {
      icon: Car,
      label: "Tipo",
      value: typeLabel,
    },
    ...(categoryLabel
      ? [
          {
            icon: Car,
            label: "Categoría",
            value: categoryLabel,
          },
        ]
      : []),
    ...(vehicle.version
      ? [
          {
            icon: Tag,
            label: "Versión",
            value: vehicle.version.name,
          },
        ]
      : []),
    ...(colorLabel
      ? [
          {
            icon: Palette,
            label: "Color",
            value: colorLabel,
          },
        ]
      : []),
    ...(vehicle.doors
      ? [
          {
            icon: DoorOpen,
            label: "Puertas",
            value: vehicle.doors.toString(),
          },
        ]
      : []),
    ...(vehicle.seats
      ? [
          {
            icon: Users,
            label: "Asientos",
            value: vehicle.seats.toString(),
          },
        ]
      : []),
    ...(vehicle.plateEnding
      ? [
          {
            icon: Hash,
            label: "Termina en",
            value: vehicle.plateEnding.toUpperCase(),
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Especificaciones
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {specs.map((spec, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <spec.icon className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">{spec.label}</p>
              <p className="font-medium text-neutral-900">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
