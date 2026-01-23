import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Car, Calendar, Gauge, Fuel, ChevronLeft, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { formatPrice, formatKilometers } from "@/lib/utils";
import { FUEL_TYPES } from "@/lib/constants";
import { MicrositeVehicleFilters } from "@/components/microsite/MicrositeVehicleFilters";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    brandId?: string;
    minYear?: string;
    maxPrice?: string;
    fuelType?: string;
    transmission?: string;
    condition?: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) return {};

  return {
    title: `Vehículos | ${config.dealer.tradeName}`,
    description: `Explora nuestro catálogo de vehículos en venta. ${config.dealer.tradeName} - calidad y confianza.`,
  };
}

type SortOption = "recent" | "price_asc" | "price_desc" | "year_desc" | "mileage_asc";

const SORT_OPTIONS: Record<SortOption, { label: string; orderBy: object }> = {
  recent: { label: "Más recientes", orderBy: { publishedAt: "desc" } },
  price_asc: { label: "Precio: menor a mayor", orderBy: { price: "asc" } },
  price_desc: { label: "Precio: mayor a menor", orderBy: { price: "desc" } },
  year_desc: { label: "Año: más nuevo", orderBy: { year: "desc" } },
  mileage_asc: { label: "Menor kilometraje", orderBy: { mileage: "asc" } },
};

export default async function MicrositeVehiculosPage({
  params,
  searchParams,
}: PageProps) {
  const { domain } = await params;
  const sp = await searchParams;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    notFound();
  }

  const { dealer } = config;
  const page = parseInt(sp.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const sort = (sp.sort as SortOption) || "recent";

  // Build where clause - always scoped to this dealer
  const where: Record<string, unknown> = {
    dealerId: dealer.id,
    status: "ACTIVE",
  };

  if (sp.brandId) where.brandId = sp.brandId;
  if (sp.condition) where.condition = sp.condition;
  if (sp.fuelType) where.fuelType = sp.fuelType;
  if (sp.transmission) where.transmission = sp.transmission;

  if (sp.maxPrice) {
    where.price = { lte: parseInt(sp.maxPrice) };
  }
  if (sp.minYear) {
    where.year = { gte: parseInt(sp.minYear) };
  }

  const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS.recent;
  const orderBy = [{ featured: "desc" as const }, sortConfig.orderBy];

  const [vehicles, total, brands] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        brand: { select: { id: true, name: true } },
        model: { select: { id: true, name: true } },
        images: {
          select: { url: true, isPrimary: true },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    }),
    prisma.vehicle.count({ where }),
    // Get brands that this dealer has vehicles for
    prisma.brand.findMany({
      where: {
        vehicles: { some: { dealerId: dealer.id, status: "ACTIVE" } },
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">
            Nuestros Vehículos
          </h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "vehículo disponible" : "vehículos disponibles"}
          </p>
        </div>

        {/* Filters + Sort */}
        <MicrositeVehicleFilters
          brands={brands}
          currentSort={sort}
          sortOptions={Object.entries(SORT_OPTIONS).map(([key, val]) => ({
            value: key,
            label: val.label,
          }))}
        />

        {/* Vehicle Grid */}
        {vehicles.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center mt-6">
            <Car className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No se encontraron vehículos
            </h3>
            <p className="text-neutral-500 text-sm">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {vehicles.map((vehicle) => {
              const image = vehicle.images[0]?.url;
              const fuelLabel =
                FUEL_TYPES[vehicle.fuelType as keyof typeof FUEL_TYPES]?.label ||
                vehicle.fuelType;

              return (
                <Link
                  key={vehicle.id}
                  href={`/vehiculos/${vehicle.slug}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="aspect-[4/3] relative bg-neutral-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={vehicle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Car className="h-12 w-12 text-neutral-300" />
                      </div>
                    )}
                    {vehicle.condition === "NUEVO" && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        Nuevo
                      </span>
                    )}
                    {vehicle.featured && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
                        Destacado
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2 group-hover:text-neutral-700">
                      {vehicle.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {vehicle.brand?.name} {vehicle.model?.name}
                    </p>
                    <p
                      className="font-bold mt-2 text-lg"
                      style={{ color: "var(--ms-primary)" }}
                    >
                      {formatPrice(vehicle.price)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {vehicle.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        {formatKilometers(vehicle.mileage)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="h-3.5 w-3.5" />
                        {fuelLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} total={total} />
        )}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  total,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
}) {
  const limit = 12;
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const createPageUrl = (page: number) => {
    return `?page=${page}`;
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-neutral-600">
        Mostrando {start}-{end} de {total} resultados
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
        <span className="text-sm text-neutral-600">
          Página {currentPage} de {totalPages}
        </span>
        {currentPage < totalPages && (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
