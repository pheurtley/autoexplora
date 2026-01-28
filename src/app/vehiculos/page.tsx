import { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehiclePagination } from "@/components/vehicles/VehiclePagination";
import { VehicleSort } from "@/components/vehicles/VehicleSort";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { ActiveFilters } from "@/components/vehicles/ActiveFilters";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import {
  VehicleType,
  VehicleCategory,
  VehicleCondition,
  FuelType,
  Transmission,
} from "@prisma/client";

// Parameters that affect content (should be included in canonical)
const CONTENT_PARAMS = [
  "vehicleType",
  "type",
  "category",
  "brandId",
  "modelId",
  "regionId",
  "condition",
  "fuelType",
  "transmission",
  "minPrice",
  "maxPrice",
  "minYear",
  "maxYear",
  "minMileage",
  "maxMileage",
  "color",
  "doors",
  "sellerType",
  "search",
];

// Build canonical URL by normalizing parameters
function buildCanonicalUrl(params: Record<string, string | undefined>): string {
  const normalized = new URLSearchParams();

  // Sort parameters alphabetically and only include content-affecting ones
  CONTENT_PARAMS.sort().forEach((key) => {
    const value = params[key];
    if (value) {
      normalized.append(key, value);
    }
  });

  const queryString = normalized.toString();
  return queryString ? `/vehiculos?${queryString}` : "/vehiculos";
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
    type?: string;
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
    sellerType?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const canonical = buildCanonicalUrl(params);

  return {
    title: `Buscar Vehículos | ${SITE_NAME}`,
    description:
      "Encuentra autos, motos y vehículos comerciales en venta en Chile. Filtra por marca, modelo, precio, año y más.",
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Buscar Vehículos | ${SITE_NAME}`,
      description:
        "Encuentra autos, motos y vehículos comerciales en venta en Chile. Filtra por marca, modelo, precio, año y más.",
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_CL",
    },
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

// Check if we should redirect to a SEO-friendly URL
async function checkSeoRedirect(params: Record<string, string | undefined>) {
  // Only redirect when filtering by single brand or region (without other major filters)
  const hasOnlyBrandFilter =
    params.brandId &&
    !params.modelId &&
    !params.regionId &&
    !params.search &&
    !params.vehicleType &&
    !params.type &&
    !params.category;

  const hasOnlyRegionFilter =
    params.regionId &&
    !params.brandId &&
    !params.modelId &&
    !params.search &&
    !params.vehicleType &&
    !params.type &&
    !params.category;

  const hasBrandAndModelFilter =
    params.brandId &&
    params.modelId &&
    !params.regionId &&
    !params.search &&
    !params.vehicleType &&
    !params.type &&
    !params.category;

  if (hasOnlyBrandFilter) {
    const brand = await prisma.brand.findUnique({
      where: { id: params.brandId },
      select: { slug: true },
    });
    if (brand) {
      // Preserve other query params (sort, page, price filters, etc.)
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (key !== "brandId" && value) {
          queryParams.append(key, value);
        }
      });
      const query = queryParams.toString();
      redirect(`/vehiculos/marca/${brand.slug}${query ? `?${query}` : ""}`);
    }
  }

  if (hasBrandAndModelFilter) {
    const [brand, model] = await Promise.all([
      prisma.brand.findUnique({
        where: { id: params.brandId },
        select: { slug: true },
      }),
      prisma.model.findUnique({
        where: { id: params.modelId },
        select: { slug: true },
      }),
    ]);
    if (brand && model) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (key !== "brandId" && key !== "modelId" && value) {
          queryParams.append(key, value);
        }
      });
      const query = queryParams.toString();
      redirect(`/vehiculos/marca/${brand.slug}/${model.slug}${query ? `?${query}` : ""}`);
    }
  }

  if (hasOnlyRegionFilter) {
    const region = await prisma.region.findUnique({
      where: { id: params.regionId },
      select: { slug: true },
    });
    if (region) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (key !== "regionId" && value) {
          queryParams.append(key, value);
        }
      });
      const query = queryParams.toString();
      redirect(`/vehiculos/region/${region.slug}${query ? `?${query}` : ""}`);
    }
  }
}

export default async function VehiculosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Check for SEO redirects
  await checkSeoRedirect(params);

  const page = parseInt(params.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const sort = (params.sort as SortOption) || "recent";

  // Build where clause
  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  // Validate enum values before using them
  const validVehicleTypes = Object.values(VehicleType);
  const validCategories = Object.values(VehicleCategory);

  // Support both 'type' and 'vehicleType' params (type is for backwards compatibility)
  const vehicleTypeParam = params.vehicleType || params.type;
  if (vehicleTypeParam && validVehicleTypes.includes(vehicleTypeParam as VehicleType)) {
    where.vehicleType = vehicleTypeParam as VehicleType;
  }
  if (params.category && validCategories.includes(params.category as VehicleCategory)) {
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
  const validConditions = Object.values(VehicleCondition);
  const validFuelTypes = Object.values(FuelType);
  const validTransmissions = Object.values(Transmission);

  if (params.condition && validConditions.includes(params.condition as VehicleCondition)) {
    where.condition = params.condition as VehicleCondition;
  }
  if (params.fuelType && validFuelTypes.includes(params.fuelType as FuelType)) {
    where.fuelType = params.fuelType as FuelType;
  }
  if (params.transmission && validTransmissions.includes(params.transmission as Transmission)) {
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

  if (params.sellerType === "dealer") {
    where.dealerId = { not: null };
  } else if (params.sellerType === "particular") {
    where.dealerId = null;
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
