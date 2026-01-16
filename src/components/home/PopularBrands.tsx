import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ArrowRight, Car } from "lucide-react";
import prisma from "@/lib/prisma";

interface PopularBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  vehicleCount: number;
}

async function getPopularBrands(): Promise<PopularBrand[]> {
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
    take: 12,
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    vehicleCount: brand._count.vehicles,
  }));
}

export async function PopularBrands() {
  const brands = await getPopularBrands();

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

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/vehiculos?marca=${brand.slug}`}
              className="group flex flex-col items-center p-4 bg-white rounded-xl border border-neutral-200 hover:border-andino-300 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 mb-3 flex items-center justify-center bg-neutral-50 rounded-lg group-hover:bg-andino-50 transition-colors">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <Car className="h-8 w-8 text-neutral-400 group-hover:text-andino-500 transition-colors" />
                )}
              </div>
              <span className="text-sm font-medium text-neutral-800 group-hover:text-andino-700 transition-colors text-center">
                {brand.name}
              </span>
              <span className="text-xs text-neutral-500 mt-1">
                {brand.vehicleCount} vehículo{brand.vehicleCount !== 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
