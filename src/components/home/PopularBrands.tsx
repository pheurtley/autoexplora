import Link from "next/link";
import { Container } from "@/components/layout";
import { AnimatedBrandsGrid } from "./AnimatedBrandsGrid";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

interface PopularBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  vehicleCount: number;
}

async function getPopularBrands(limit: number = 12): Promise<PopularBrand[]> {
  const brands = await prisma.brand.findMany({
    where: {
      vehicles: {
        some: {
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      _count: {
        select: {
          vehicles: {
            where: {
              status: "ACTIVE",
            },
          },
        },
      },
    },
    orderBy: {
      vehicles: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    vehicleCount: brand._count.vehicles,
  }));
}

interface PopularBrandsProps {
  limit?: number;
}

export async function PopularBrands({ limit = 12 }: PopularBrandsProps) {
  const brands = await getPopularBrands(limit);

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Marcas populares
          </h2>
          <Link href="/vehiculos">
            <Button variant="ghost" size="sm">
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <AnimatedBrandsGrid brands={brands} />
      </Container>
    </section>
  );
}
