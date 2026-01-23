import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone, Calendar, Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { ImageGallery } from "@/components/vehicles/ImageGallery";
import { VehicleSpecs } from "@/components/vehicles/VehicleSpecs";
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: vehicle.images[0]?.url ? [vehicle.images[0].url] : undefined,
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

  const publishedDate = vehicle.publishedAt
    ? new Date(vehicle.publishedAt).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const whatsappNumber = config.contactWhatsApp?.replace(/[^0-9]/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el ${vehicle.title} que vi en su sitio web.`
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
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

            {/* Publication Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                {publishedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Publicado el {publishedDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{vehicle.views} visitas</span>
                </div>
              </div>
            </div>
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
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">
                Contactar a {dealer.tradeName}
              </h3>

              <div className="space-y-3">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                )}

                {config.contactPhone && (
                  <a
                    href={`tel:${config.contactPhone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 rounded-lg font-medium transition-colors"
                    style={{
                      borderColor: "var(--ms-primary)",
                      color: "var(--ms-primary)",
                    }}
                  >
                    <Phone className="h-5 w-5" />
                    Llamar
                  </a>
                )}

                <Link
                  href="/contacto"
                  className="flex items-center justify-center w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors text-sm"
                >
                  Enviar consulta
                </Link>
              </div>

              {/* Location */}
              {(dealer.comuna || dealer.region) && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
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
    </div>
  );
}
