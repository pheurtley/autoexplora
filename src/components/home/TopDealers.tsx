import Link from "next/link";
import { Container } from "@/components/layout";
import { AnimatedDealersGrid } from "./AnimatedDealersGrid";
import { Button } from "@/components/ui";
import { ArrowRight, Building2 } from "lucide-react";
import prisma from "@/lib/prisma";

interface TopDealer {
  id: string;
  slug: string;
  tradeName: string;
  logo: string | null;
  type: "AUTOMOTORA" | "RENT_A_CAR";
  region: {
    name: string;
  };
  vehicleCount: number;
}

async function getTopDealers(limit: number = 6): Promise<TopDealer[]> {
  try {
    const dealers = await prisma.dealer.findMany({
      where: {
        status: "ACTIVE",
        vehicles: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        slug: true,
        tradeName: true,
        logo: true,
        type: true,
        region: {
          select: {
            name: true,
          },
        },
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

    return dealers.map((dealer) => ({
      id: dealer.id,
      slug: dealer.slug,
      tradeName: dealer.tradeName,
      logo: dealer.logo,
      type: dealer.type,
      region: dealer.region,
      vehicleCount: dealer._count.vehicles,
    }));
  } catch (error) {
    console.error("Error fetching top dealers:", error);
    return [];
  }
}

interface TopDealersProps {
  limit?: number;
}

export async function TopDealers({ limit = 6 }: TopDealersProps) {
  const dealers = await getTopDealers(limit);

  if (dealers.length === 0) {
    return (
      <section className="py-12 bg-neutral-50">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Dealers destacados
            </h2>
          </div>

          <div className="text-center py-12 bg-white rounded-xl">
            <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              No hay dealers disponibles
            </h3>
            <p className="text-neutral-500 mb-4">
              Pronto tendremos dealers destacados en nuestro marketplace
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 bg-neutral-50">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Dealers destacados
            </h2>
            <p className="text-neutral-600 mt-1">
              Automotoras y rent a car con más vehículos disponibles
            </p>
          </div>
          <Link href="/dealers">
            <Button variant="ghost" size="sm">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <AnimatedDealersGrid dealers={dealers} />
      </Container>
    </section>
  );
}
