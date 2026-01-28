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
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo";
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
  params: Promise<{ brandSlug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: SortOption;
    vehicleType?: string;
    category?: string;
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

const SORT_OPTIONS: Record<SortOption, { label: string; orderBy: object }> = {
  recent: { label: "Más recientes", orderBy: { publishedAt: "desc" } },
  price_asc: { label: "Precio: menor a mayor", orderBy: { price: "asc" } },
  price_desc: { label: "Precio: mayor a menor", orderBy: { price: "desc" } },
  year_desc: { label: "Año: más nuevo", orderBy: { year: "desc" } },
  mileage_asc: { label: "Menor kilometraje", orderBy: { mileage: "asc" } },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    select: { name: true, slug: true },
  });

  if (!brand) {
    return { title: "Marca no encontrada" };
  }

  const title = `${brand.name} en Venta en Chile`;
  const description = `Encuentra vehículos ${brand.name} en venta. Autos, SUVs, camionetas y más modelos ${brand.name} disponibles en AutoExplora.cl`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: `/vehiculos/marca/${brand.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/vehiculos/marca/${brand.slug}`,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_CL",
    },
  };
}

export default async function BrandVehiclesPage({ params, searchParams }: PageProps) {
  const { brandSlug } = await params;
  const searchParamsResolved = await searchParams;

  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    include: {
      models: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  const page = parseInt(searchParamsResolved.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const sort = (searchParamsResolved.sort as SortOption) || "recent";

  // Build where clause
  const where: Record<string, unknown> = {
    status: "ACTIVE",
    brandId: brand.id,
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
  if (searchParamsResolved.modelId) {
    where.modelId = searchParamsResolved.modelId;
  }
  if (searchParamsResolved.regionId) {
    where.regionId = searchParamsResolved.regionId;
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

  // Fetch vehicles, count, and regions in parallel
  const [vehicles, total, allBrands, regions] = await Promise.all([
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

  // Get selected model/region names for active filters
  const selectedModel = searchParamsResolved.modelId
    ? brand.models.find((m) => m.id === searchParamsResolved.modelId)
    : null;
  const selectedRegion = searchParamsResolved.regionId
    ? regions.find((r) => r.id === searchParamsResolved.regionId)
    : null;

  // Build filters with brand pre-selected
  const currentFilters = {
    ...searchParamsResolved,
    brandId: brand.id,
  };

  // Generate FAQ items for SEO
  const faqItems = [
    {
      question: `¿Dónde puedo comprar un ${brand.name} usado en Chile?`,
      answer: `En AutoExplora.cl encontrarás ${total} vehículos ${brand.name} en venta de particulares y automotoras en todo Chile. Puedes filtrar por modelo, año, precio y ubicación para encontrar el ${brand.name} ideal para ti.`,
    },
    {
      question: `¿Cuánto cuesta un ${brand.name} usado?`,
      answer: `Los precios de vehículos ${brand.name} usados varían según el modelo, año y kilometraje. En AutoExplora.cl puedes comparar precios y encontrar las mejores ofertas de ${brand.name} en Chile.`,
    },
    {
      question: `¿Qué modelos de ${brand.name} están disponibles?`,
      answer: `Tenemos ${brand.models.length} modelos de ${brand.name} disponibles: ${brand.models.slice(0, 5).map(m => m.name).join(", ")}${brand.models.length > 5 ? " y más" : ""}. Explora todas las opciones en nuestra plataforma.`,
    },
    {
      question: `¿Cómo contactar a un vendedor de ${brand.name}?`,
      answer: `Cada publicación de ${brand.name} en AutoExplora.cl incluye un botón de WhatsApp para contactar directamente al vendedor. Puedes hacer consultas, solicitar más fotos o coordinar una prueba de manejo.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Vehículos", url: `${SITE_URL}/vehiculos` },
          { name: brand.name },
        ]}
      />
      <FAQJsonLd items={faqItems} />

      <div className="min-h-screen bg-neutral-50">
        <Container className="py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2">
              <Breadcrumbs
                items={[
                  { label: "Vehículos", href: "/vehiculos" },
                  { label: brand.name },
                ]}
              />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {brand.name} en Venta
            </h1>
            <p className="text-neutral-600 mt-1">
              {total} {total === 1 ? "vehículo encontrado" : "vehículos encontrados"}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <VehicleFilters
                brands={allBrands}
                regions={regions}
                currentFilters={currentFilters}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Active Filters & Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <ActiveFilters
                  filters={currentFilters}
                  brandName={brand.name}
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
    </>
  );
}
