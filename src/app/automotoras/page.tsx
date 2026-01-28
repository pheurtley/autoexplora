import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import { DealerGrid } from "@/components/dealers/DealerGrid";
import { DealerFilters } from "@/components/dealers/DealerFilters";
import { ActiveDealerFilters } from "@/components/dealers/ActiveDealerFilters";
import { DealerSort } from "@/components/dealers/DealerSort";
import { VehiclePagination } from "@/components/vehicles/VehiclePagination";
import { DealerType } from "@prisma/client";

const BASE_URL = "https://autoexplora.cl";

type SortOption = "recent" | "name" | "vehicles";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: SortOption;
    search?: string;
    type?: string;
    regionId?: string;
  }>;
}

function buildCanonicalUrl(params: Record<string, string | undefined>): string {
  const normalized = new URLSearchParams();
  const canonicalKeys = ["type", "regionId", "search", "page"];

  for (const key of canonicalKeys) {
    const value = params[key];
    if (value) {
      normalized.set(key, value);
    }
  }

  const qs = normalized.toString();
  return `${BASE_URL}/automotoras${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const canonical = buildCanonicalUrl(params);

  return {
    title: "Automotoras | AutoExplora.cl",
    description:
      "Encuentra automotoras y rent a car en Chile. Descubre los mejores negocios de venta de vehículos cerca de ti.",
    alternates: {
      canonical,
    },
  };
}

const SORT_OPTIONS: Record<SortOption, { label: string; orderBy: object }> = {
  recent: { label: "Más recientes", orderBy: { createdAt: "desc" } },
  name: { label: "Nombre A-Z", orderBy: { tradeName: "asc" } },
  vehicles: { label: "Más vehículos", orderBy: { vehicles: { _count: "desc" } } },
};

export default async function AutomotorasPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const sort = (params.sort as SortOption) || "recent";

  // Build where clause
  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (params.type) {
    where.type = params.type as DealerType;
  }

  if (params.regionId) {
    where.regionId = params.regionId;
  }

  if (params.search) {
    where.OR = [
      { tradeName: { contains: params.search, mode: "insensitive" } },
      { businessName: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS.recent;

  // Fetch dealers and count in parallel
  const [dealers, total, regions] = await Promise.all([
    prisma.dealer.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortConfig.orderBy,
      select: {
        id: true,
        slug: true,
        tradeName: true,
        type: true,
        logo: true,
        verifiedAt: true,
        region: {
          select: { id: true, name: true },
        },
        _count: {
          select: { vehicles: true },
        },
      },
    }),
    prisma.dealer.count({ where }),
    prisma.region.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Get selected region name for active filters
  const selectedRegion = params.regionId
    ? regions.find((r) => r.id === params.regionId)
    : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">
            Automotoras
          </h1>
          <p className="text-neutral-600 mt-1">
            {total} {total === 1 ? "negocio encontrado" : "negocios encontrados"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <DealerFilters
              regions={regions}
              currentFilters={params}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Active Filters & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <ActiveDealerFilters
                filters={params}
                regionName={selectedRegion?.name}
              />
              <DealerSort currentSort={sort} />
            </div>

            {/* Dealer Grid */}
            <DealerGrid dealers={dealers} />

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
