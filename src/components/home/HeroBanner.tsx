import { Container } from "@/components/layout";
import { SearchWidget } from "./SearchWidget";
import prisma from "@/lib/prisma";

function formatStatNumber(num: number): string {
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(num >= 10000 ? 0 : 1);
    return `${formatted.replace(/\.0$/, "")}K+`;
  }
  return num.toString();
}

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalVehicles, todayVehicles, regionsWithVehicles] = await Promise.all([
    prisma.vehicle.count({
      where: { status: "ACTIVE" },
    }),
    prisma.vehicle.count({
      where: {
        status: "ACTIVE",
        publishedAt: { gte: today },
      },
    }),
    prisma.region.count({
      where: {
        vehicles: {
          some: { status: "ACTIVE" },
        },
      },
    }),
  ]);

  return { totalVehicles, todayVehicles, regionsWithVehicles };
}

export async function HeroBanner() {
  const stats = await getStats();

  return (
    <section className="relative bg-gradient-to-br from-andino-600 via-andino-700 to-andino-800 py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="mountains"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 100 L50 20 L100 100 Z"
                fill="white"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mountains)" />
        </svg>
      </div>

      <Container className="relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Encuentra tu próximo vehículo
          </h1>
          <p className="text-lg md:text-xl text-andino-100 max-w-2xl mx-auto">
            Miles de autos, motos y vehículos comerciales te esperan en el
            marketplace más grande de Chile
          </p>
        </div>

        {/* Search Widget */}
        <SearchWidget />

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.totalVehicles > 0 ? formatStatNumber(stats.totalVehicles) : "0"}
            </div>
            <div className="text-sm text-andino-200">Vehículos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.todayVehicles > 0 ? formatStatNumber(stats.todayVehicles) : "0"}
            </div>
            <div className="text-sm text-andino-200">Nuevos hoy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.regionsWithVehicles > 0 ? stats.regionsWithVehicles : "16"}
            </div>
            <div className="text-sm text-andino-200">Regiones</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
