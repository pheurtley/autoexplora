import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import { Breadcrumbs } from "@/components/ui";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehiclePagination } from "@/components/vehicles/VehiclePagination";
import { VehicleSort } from "@/components/vehicles/VehicleSort";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { ActiveFilters } from "@/components/vehicles/ActiveFilters";
import { BreadcrumbJsonLd } from "@/components/seo";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import {
  VehicleType,
  VehicleCategory,
  VehicleCondition,
  FuelType,
  Transmission,
} from "@prisma/client";

type SortOption = "recent" | "price_asc" | "price_desc" | "year_desc" | "mileage_asc";

interface PageProps {
  params: Promise<{ regionSlug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: SortOption;
    vehicleType?: string;
    category?: string;
    brandId?: string;
    modelId?: string;
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
    sellerType?: string;
  }>;
}

const SORT_OPTIONS: Record<SortOption, { label: string; orderBy: object }> = {
  recent: { label: "Más recientes", orderBy: { publishedAt: "desc" } },
  price_asc: { label: "Precio: menor a mayor", orderBy: { price: "asc" } },
  price_desc: { label: "Precio: mayor a menor", orderBy: { price: "desc" } },
  year_desc: { label: "Año: más nuevo", orderBy: { year: "desc" } },
  mileage_asc: { label: "Menor kilometraje", orderBy: { mileage: "asc" } },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { regionSlug } = await params;

  const region = await prisma.region.findUnique({
    where: { slug: regionSlug },
    select: { name: true, slug: true },
  });

  if (!region) {
    return { title: "Región no encontrada" };
  }

  const title = `Vehículos en Venta en ${region.name}`;
  const description = `Encuentra autos, motos y vehículos comerciales en venta en ${region.name}. Miles de vehículos disponibles en AutoExplora.cl`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: `/vehiculos/region/${region.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/vehiculos/region/${region.slug}`,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_CL",
    },
  };
}

export default async function RegionVehiclesPage({ params, searchParams }: PageProps) {
  const { regionSlug } = await params;
  const searchParamsResolved = await searchParams;

  const region = await prisma.region.findUnique({
    where: { slug: regionSlug },
    select: { id: true, name: true, slug: true },
  });

  if (!region) {
    notFound();
  }

  const page = parseInt(searchParamsResolved.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const sort = (searchParamsResolved.sort as SortOption) || "recent";

  // Build where clause
  const where: Record<string, unknown> = {
    status: "ACTIVE",
    regionId: region.id,
  };

  // Validate enum values
  const validVehicleTypes = Object.values(VehicleType);
  const validCategories = Object.values(VehicleCategory);
  const validConditions = Object.values(VehicleCondition);
  const validFuelTypes = Object.values(FuelType);
  const validTransmissions = Object.values(Transmission);

  if (searchParamsResolved.vehicleType && validVehicleTypes.includes(searchParamsResolved.vehicleType as VehicleType)) {
    where.vehicleType = searchParamsResolved.vehicleType as VehicleType;
  }
  if (searchParamsResolved.category && validCategories.includes(searchParamsResolved.category as VehicleCategory)) {
    where.category = searchParamsResolved.category as VehicleCategory;
  }
  if (searchParamsResolved.brandId) {
    where.brandId = searchParamsResolved.brandId;
  }
  if (searchParamsResolved.modelId) {
    where.modelId = searchParamsResolved.modelId;
  }
  if (searchParamsResolved.condition && validConditions.includes(searchParamsResolved.condition as VehicleCondition)) {
    where.condition = searchParamsResolved.condition as VehicleCondition;
  }
  if (searchParamsResolved.fuelType && validFuelTypes.includes(searchParamsResolved.fuelType as FuelType)) {
    where.fuelType = searchParamsResolved.fuelType as FuelType;
  }
  if (searchParamsResolved.transmission && validTransmissions.includes(searchParamsResolved.transmission as Transmission)) {
    where.transmission = searchParamsResolved.transmission as Transmission;
  }

  if (searchParamsResolved.minPrice || searchParamsResolved.maxPrice) {
    where.price = {};
    if (searchParamsResolved.minPrice) {
      (where.price as Record<string, number>).gte = parseInt(searchParamsResolved.minPrice);
    }
    if (searchParamsResolved.maxPrice) {
      (where.price as Record<string, number>).lte = parseInt(searchParamsResolved.maxPrice);
    }
  }

  if (searchParamsResolved.minYear || searchParamsResolved.maxYear) {
    where.year = {};
    if (searchParamsResolved.minYear) {
      (where.year as Record<string, number>).gte = parseInt(searchParamsResolved.minYear);
    }
    if (searchParamsResolved.maxYear) {
      (where.year as Record<string, number>).lte = parseInt(searchParamsResolved.maxYear);
    }
  }

  if (searchParamsResolved.minMileage || searchParamsResolved.maxMileage) {
    where.mileage = {};
    if (searchParamsResolved.minMileage) {
      (where.mileage as Record<string, number>).gte = parseInt(searchParamsResolved.minMileage);
    }
    if (searchParamsResolved.maxMileage) {
      (where.mileage as Record<string, number>).lte = parseInt(searchParamsResolved.maxMileage);
    }
  }

  if (searchParamsResolved.color) {
    where.color = searchParamsResolved.color;
  }

  if (searchParamsResolved.doors) {
    where.doors = parseInt(searchParamsResolved.doors);
  }

  if (searchParamsResolved.sellerType === "dealer") {
    where.dealerId = { not: null };
  } else if (searchParamsResolved.sellerType === "particular") {
    where.dealerId = null;
  }

  // Build orderBy
  const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS.recent;
  const orderBy = [{ featured: "desc" as const }, sortConfig.orderBy];

  // Fetch vehicles, count, brands, and regions in parallel
  const [vehicles, total, brands, allRegions] = await Promise.all([
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

  // Get selected brand/model names for active filters
  const selectedBrand = searchParamsResolved.brandId
    ? brands.find((b) => b.id === searchParamsResolved.brandId)
    : null;
  const selectedModel =
    searchParamsResolved.modelId && selectedBrand
      ? selectedBrand.models.find((m) => m.id === searchParamsResolved.modelId)
      : null;

  // Build filters with region pre-selected
  const currentFilters = {
    ...searchParamsResolved,
    regionId: region.id,
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Vehículos", url: `${SITE_URL}/vehiculos` },
          { name: region.name },
        ]}
      />

      <div className="min-h-screen bg-neutral-50">
        <Container className="py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2">
              <Breadcrumbs
                items={[
                  { label: "Vehículos", href: "/vehiculos" },
                  { label: region.name },
                ]}
              />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Vehículos en Venta en {region.name}
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
                regions={allRegions}
                currentFilters={currentFilters}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Active Filters & Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <ActiveFilters
                  filters={currentFilters}
                  brandName={selectedBrand?.name}
                  modelName={selectedModel?.name}
                  regionName={region.name}
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
    </>
  );
}
