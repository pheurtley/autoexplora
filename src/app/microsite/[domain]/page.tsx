import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Car, ArrowRight, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { getOptimizedUrl } from "@/lib/cloudinary";
import { MicrositeLocalBusinessJsonLd } from "@/components/microsite/MicrositeJsonLd";
import { PageViewTracker } from "@/components/tracking";

const defaultWhyUsFeatures = [
  { icon: "check", title: "Garantía", description: "Vehículos con garantía y respaldo profesional." },
  { icon: "money", title: "Financiamiento", description: "Opciones de financiamiento a tu medida." },
  { icon: "chat", title: "Atención Personalizada", description: "Te acompañamos en todo el proceso de compra." },
];

const iconPaths: Record<string, string> = {
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  money: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  chat: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  heart: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  truck: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
};

function WhyUsIcon({ name }: { name: string }) {
  const d = iconPaths[name] || iconPaths.check;
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function MicrositeHomePage({ params }: PageProps) {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    notFound();
  }

  const { dealer } = config;

  // Fetch featured vehicles
  const vehicles = config.showFeaturedVehicles
    ? await prisma.vehicle.findMany({
        where: {
          dealerId: dealer.id,
          status: "ACTIVE",
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: config.featuredVehiclesLimit,
        include: {
          brand: { select: { name: true } },
          model: { select: { name: true } },
          images: {
            select: { url: true, isPrimary: true },
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      })
    : [];

  const heroTitle =
    config.heroTitle || `Bienvenido a ${dealer.tradeName}`;
  const heroSubtitle =
    config.heroSubtitle ||
    "Encuentra el vehículo perfecto para ti. Calidad y confianza garantizada.";

  const verifiedDomain = config.domains.find((d) => d.isPrimary && d.status === "VERIFIED");
  const siteUrl = verifiedDomain
    ? `https://${verifiedDomain.domain}`
    : `https://${domain}.autoexplora.cl`;

  const whyUsFeatures = (config.whyUsFeatures as { icon: string; title: string; description: string }[] | null) || [];

  return (
    <div>
      {/* Page View Tracking */}
      <PageViewTracker
        pageType="MICROSITE_HOME_VIEW"
        dealerId={dealer.id}
        source="microsite"
      />

      <MicrositeLocalBusinessJsonLd config={config} url={siteUrl} />

      {/* Hero Section */}
      <section
        className="relative py-20 sm:py-28 overflow-hidden"
        style={!config.heroImage ? { backgroundColor: "var(--ms-primary)" } : undefined}
      >
        {config.heroImage && (
          <>
            <Image
              src={config.heroImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/vehiculos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              style={{ color: "var(--ms-primary)" }}
            >
              <Car className="h-5 w-5" />
              Ver Vehículos
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-sm sm:text-base"
            >
              Contáctanos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {dealer.comuna && (
            <p className="mt-6 text-white/60 text-sm flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              {dealer.comuna.name}
              {dealer.region && `, ${dealer.region.name}`}
            </p>
          )}
        </div>
      </section>

      {/* Featured Vehicles */}
      {vehicles.length > 0 && (
        <section className="py-12 sm:py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">
                Vehículos Destacados
              </h2>
              <Link
                href="/vehiculos"
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: "var(--ms-primary)" }}
              >
                Ver todos &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicles.map((vehicle, index) => {
                const image = vehicle.images[0]?.url;
                const price = vehicle.price
                  ? `$${vehicle.price.toLocaleString("es-CL")}`
                  : "Consultar";

                return (
                  <Link
                    key={vehicle.id}
                    href={`/vehiculos/${vehicle.slug}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    <div className="aspect-[4/3] relative bg-neutral-100">
                      {image ? (
                        <Image
                          src={getOptimizedUrl(image, "card")}
                          alt={vehicle.title}
                          fill
                          priority={index === 0}
                          className="object-cover object-[center_70%] group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Car className="h-12 w-12 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-900 text-sm line-clamp-2">
                        {vehicle.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {vehicle.brand?.name} {vehicle.model?.name}{" "}
                        {vehicle.year && `· ${vehicle.year}`}
                      </p>
                      <p
                        className="font-bold mt-2 text-lg"
                        style={{ color: "var(--ms-primary)" }}
                      >
                        {price}
                      </p>
                      {vehicle.mileage != null && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {vehicle.mileage.toLocaleString("es-CL")} km
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* About / Why Us */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            {config.whyUsTitle || "¿Por qué elegirnos?"}
          </h2>
          <p className="text-neutral-600 mb-8">
            {config.whyUsSubtitle ||
              `En ${dealer.tradeName} nos comprometemos con la calidad y transparencia. Cada vehículo es revisado para garantizar tu satisfacción.`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {(whyUsFeatures.length > 0 ? whyUsFeatures : defaultWhyUsFeatures).map(
              (feature, idx) => (
                <div key={idx} className="p-4">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--ms-primary) 10%, transparent)",
                      color: "var(--ms-primary)",
                    }}
                  >
                    <WhyUsIcon name={feature.icon} />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-500">{feature.description}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
