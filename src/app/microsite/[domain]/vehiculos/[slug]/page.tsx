import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { ImageGallery } from "@/components/vehicles/ImageGallery";
import { VehicleSpecs } from "@/components/vehicles/VehicleSpecs";
import { MicrositeVehicleJsonLd } from "@/components/microsite/MicrositeJsonLd";
import { MicrositeVehicleContactButtons } from "@/components/microsite/MicrositeVehicleContactButtons";
import { formatPrice, formatKilometers } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ domain: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain, slug } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) return {};

  const vehicle = await prisma.vehicle.findUnique({
    where: { slug, dealerId: config.dealer.id, status: "ACTIVE" },
    select: {
      title: true,
      price: true,
      year: true,
      mileage: true,
      condition: true,
      brand: { select: { name: true } },
      model: { select: { name: true } },
      images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
    },
  });

  if (!vehicle) return { title: "Vehículo no encontrado" };

  const title = `${vehicle.brand.name} ${vehicle.model.name} ${vehicle.year}`;
  const conditionText = vehicle.condition === "NUEVO" ? "Nuevo" : "Usado";
  const description = `${conditionText} · ${formatKilometers(vehicle.mileage)} · ${formatPrice(vehicle.price)}. ${config.dealer.tradeName}`;

  const ogImage = vehicle.images[0]?.url || config.ogImage || config.logo || config.favicon;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function MicrositeVehicleDetailPage({ params }: PageProps) {
  const { domain, slug } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    notFound();
  }

  const { dealer } = config;

  const vehicle = await prisma.vehicle.findUnique({
    where: { slug, dealerId: dealer.id, status: "ACTIVE" },
    include: {
      brand: true,
      model: true,
      version: true,
      region: true,
      comuna: true,
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!vehicle) {
    notFound();
  }

  // Increment views
  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: { views: { increment: 1 } },
  });

  const whatsappNumber = config.contactWhatsApp?.replace(/[^0-9]/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el ${vehicle.title} que vi en su sitio web.`
  );

  const verifiedDomain = config.domains.find((d) => d.isPrimary && d.status === "VERIFIED");
  const siteUrl = verifiedDomain
    ? `https://${verifiedDomain.domain}`
    : `https://${domain}.autoexplora.cl`;

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <MicrositeVehicleJsonLd
        vehicle={vehicle}
        dealerName={dealer.tradeName}
        url={`${siteUrl}/vehiculos/${vehicle.slug}`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Back link */}
        <Link
          href="/vehiculos"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={vehicle.images} title={vehicle.title} />

            {/* Title and Price - Mobile */}
            <div className="lg:hidden bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                {vehicle.condition === "NUEVO" && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Nuevo
                  </span>
                )}
                {vehicle.condition === "USADO" && (
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded">
                    Usado
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {vehicle.title}
              </h1>
              <p
                className="text-3xl font-bold mt-3"
                style={{ color: "var(--ms-primary)" }}
              >
                {formatPrice(vehicle.price)}
              </p>
              {vehicle.negotiable && (
                <p className="text-sm text-neutral-500 mt-1">Precio negociable</p>
              )}
            </div>

            {/* Specifications */}
            <VehicleSpecs vehicle={vehicle} />

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Descripción
                </h2>
                <p className="text-neutral-600 whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}

          </div>

          {/* Right Column - Price & Contact */}
          <div className="space-y-6">
            {/* Title and Price - Desktop */}
            <div className="hidden lg:block bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                {vehicle.condition === "NUEVO" && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Nuevo
                  </span>
                )}
                {vehicle.condition === "USADO" && (
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded">
                    Usado
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {vehicle.title}
              </h1>
              <p
                className="text-3xl font-bold mt-4"
                style={{ color: "var(--ms-primary)" }}
              >
                {formatPrice(vehicle.price)}
              </p>
              {vehicle.negotiable && (
                <p className="text-sm text-neutral-500 mt-1">Precio negociable</p>
              )}
            </div>

            {/* Contact Card */}
            <MicrositeVehicleContactButtons
              vehicleId={vehicle.id}
              dealerId={dealer.id}
              dealerName={dealer.tradeName}
              whatsappNumber={whatsappNumber || null}
              whatsappMessage={whatsappMessage}
              contactPhone={config.contactPhone}
            />

            {/* Location */}
            {(dealer.comuna || dealer.region) && (
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">
                  📍 {dealer.comuna?.name}
                  {dealer.region && `, ${dealer.region.name}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
