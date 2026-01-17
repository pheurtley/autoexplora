import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehiclePagination } from "@/components/vehicles/VehiclePagination";
import { VehicleSort } from "@/components/vehicles/VehicleSort";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { ActiveFilters } from "@/components/vehicles/ActiveFilters";
import {
  VehicleType,
  VehicleCategory,
  VehicleCondition,
  FuelType,
  Transmission,
} from "@prisma/client";

export const metadata: Metadata = {
  title: "Buscar Vehículos | AutoExplora.cl",
  description:
    "Encuentra autos, motos y vehículos comerciales en venta en Chile. Filtra por marca, modelo, precio, año y más.",
};

type SortOption = "recent" | "price_asc" | "price_desc" | "year_desc" | "mileage_asc";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: SortOption;
    search?: string;
    vehicleType?: string;
    category?: string;
    brandId?: string;
    modelId?: string;
    regionId?: string;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    minMileage?: string;
    maxMileage?: string;
    color?: string;
    doors?: string;
  }>;
}

const SORT_OPTIONS: Record<SortOption, { label: string; orderBy: object }> = {
  recent: { label: "Más recientes", orderBy: { publishedAt: "desc" } },
  price_asc: { label: "Precio: menor a mayor", orderBy: { price: "asc" } },
  price_desc: { label: "Precio: mayor a menor", orderBy: { price: "desc" } },
  year_desc: { label: "Año: más nuevo", orderBy: { year: "desc" } },
  mileage_asc: { label: "Menor kilometraje", orderBy: { mileage: "asc" } },
};

export default async function VehiculosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const sort = (params.sort as SortOption) || "recent";

  // Build where clause
  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (params.vehicleType) {
    where.vehicleType = params.vehicleType as VehicleType;
  }
  if (params.category) {
    where.category = params.category as VehicleCategory;
  }
  if (params.brandId) {
    where.brandId = params.brandId;
  }
  if (params.modelId) {
    where.modelId = params.modelId;
  }
  if (params.regionId) {
    where.regionId = params.regionId;
  }
  if (params.condition) {
    where.condition = params.condition as VehicleCondition;
  }
  if (params.fuelType) {
    where.fuelType = params.fuelType as FuelType;
  }
  if (params.transmission) {
    where.transmission = params.transmission as Transmission;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) {
      (where.price as Record<string, number>).gte = parseInt(params.minPrice);
    }
    if (params.maxPrice) {
      (where.price as Record<string, number>).lte = parseInt(params.maxPrice);
    }
  }

  if (params.minYear || params.maxYear) {
    where.year = {};
    if (params.minYear) {
      (where.year as Record<string, number>).gte = parseInt(params.minYear);
    }
    if (params.maxYear) {
      (where.year as Record<string, number>).lte = parseInt(params.maxYear);
    }
  }

  if (params.minMileage || params.maxMileage) {
    where.mileage = {};
    if (params.minMileage) {
      (where.mileage as Record<string, number>).gte = parseInt(params.minMileage);
    }
    if (params.maxMileage) {
      (where.mileage as Record<string, number>).lte = parseInt(params.maxMileage);
    }
  }

  if (params.color) {
    where.color = params.color;
  }

  if (params.doors) {
    where.doors = parseInt(params.doors);
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS.recent;
  const orderBy = [{ featured: "desc" as const }, sortConfig.orderBy];

  // Fetch vehicles and count in parallel
  const [vehicles, total, brands, regions] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        model: { select: { id: true, name: true, slug: true } },
        region: { select: { id: true, name: true, slug: true } },
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: { order: "asc" },
          take: 5,
        },
      },
    }),
    prisma.vehicle.count({ where }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        models: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.region.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Get selected brand/model/region names for active filters
  const selectedBrand = params.brandId
    ? brands.find((b) => b.id === params.brandId)
    : null;
  const selectedModel =
    params.modelId && selectedBrand
      ? selectedBrand.models.find((m) => m.id === params.modelId)
      : null;
  const selectedRegion = params.regionId
    ? regions.find((r) => r.id === params.regionId)
    : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">
            Vehículos en Venta
          </h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "vehículo encontrado" : "vehículos encontrados"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <VehicleFilters
              brands={brands}
              regions={regions}
              currentFilters={params}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Active Filters & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <ActiveFilters
                filters={params}
                brandName={selectedBrand?.name}
                modelName={selectedModel?.name}
                regionName={selectedRegion?.name}
              />
              <VehicleSort currentSort={sort} />
            </div>

            {/* Vehicle Grid */}
            <VehicleGrid vehicles={vehicles} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <VehiclePagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={total}
                />
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
