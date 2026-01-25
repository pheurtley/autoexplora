import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import { ImageGallery } from "@/components/vehicles/ImageGallery";
import { VehicleSpecs } from "@/components/vehicles/VehicleSpecs";
import { ContactCard } from "@/components/vehicles/ContactCard";
import { DealerInfoCard } from "@/components/vehicles/DealerInfoCard";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";
import { ShareButtons } from "@/components/vehicles/ShareButtons";
import { RelatedVehicles } from "@/components/vehicles/RelatedVehicles";
import { MobileStickyContact } from "@/components/vehicles/MobileStickyContact";
import { VehicleJsonLd, BreadcrumbJsonLd } from "@/components/seo";
import { Badge } from "@/components/ui";
import type { WeekSchedule } from "@/components/ui";
import { formatPrice, formatKilometers, isCuid } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { Star } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to find vehicle by slug or ID (for backwards compatibility)
async function findVehicleForMetadata(param: string) {
  const select = {
    id: true,
    slug: true,
    title: true,
    price: true,
    year: true,
    mileage: true,
    condition: true,
    brand: { select: { name: true } },
    model: { select: { name: true } },
    images: { select: { url: true }, orderBy: { order: "asc" as const }, take: 1 },
  };

  // First try by slug
  let vehicle = await prisma.vehicle.findUnique({
    where: { slug: param },
    select,
  });

  // If not found and looks like a CUID, try by ID
  if (!vehicle && isCuid(param)) {
    vehicle = await prisma.vehicle.findUnique({
      where: { id: param },
      select,
    });
  }

  return vehicle;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: param } = await params;

  const vehicle = await findVehicleForMetadata(param);

  if (!vehicle) {
    return { title: "Vehículo no encontrado" };
  }

  const title = `${vehicle.brand.name} ${vehicle.model.name} ${vehicle.year}`;
  const conditionText = vehicle.condition === "NUEVO" ? "Nuevo" : "Usado";
  const description = `${conditionText} · ${formatKilometers(vehicle.mileage)} · ${formatPrice(vehicle.price)}. Ver fotos, especificaciones y contactar al vendedor en ${SITE_NAME}.`;
  const url = `${SITE_URL}/vehiculos/${vehicle.slug}`;
  const imageUrl = vehicle.images[0]?.url;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: `/vehiculos/${vehicle.slug}`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "es_CL",
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl && {
        images: [imageUrl],
      }),
    },
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug: param } = await params;
  const session = await auth();

  // First try by slug
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: param, status: "ACTIVE" },
    include: {
      brand: true,
      model: true,
      version: true,
      region: true,
      comuna: true,
      images: { orderBy: { order: "asc" } },
      user: { select: { id: true, name: true, image: true, createdAt: true } },
      dealer: {
        select: {
          id: true,
          slug: true,
          tradeName: true,
          type: true,
          logo: true,
          phone: true,
          whatsapp: true,
          verifiedAt: true,
          schedule: true,
        },
      },
    },
  });

  // If not found and param looks like a CUID, try by ID and redirect
  if (!vehicle && isCuid(param)) {
    const vehicleById = await prisma.vehicle.findUnique({
      where: { id: param },
      select: { slug: true },
    });

    if (vehicleById?.slug) {
      redirect(`/vehiculos/${vehicleById.slug}`);
    }
  }

  if (!vehicle) {
    notFound();
  }

  // Increment views
  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: { views: { increment: 1 } },
  });

  // Check if favorited by current user
  let isFavorited = false;
  if (session?.user?.id) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_vehicleId: {
          userId: session.user.id,
          vehicleId: vehicle.id,
        },
      },
    });
    isFavorited = !!favorite;
  }

  const vehicleUrl = `${SITE_URL}/vehiculos/${vehicle.slug}`;

  return (
    <>
      {/* Structured Data */}
      <VehicleJsonLd
        name={vehicle.title}
        description={vehicle.description}
        brand={vehicle.brand.name}
        model={vehicle.model.name}
        year={vehicle.year}
        mileage={vehicle.mileage}
        fuelType={vehicle.fuelType}
        transmission={vehicle.transmission}
        condition={vehicle.condition}
        price={vehicle.price}
        image={vehicle.images[0]?.url}
        url={vehicleUrl}
        seller={{
          type: vehicle.dealer ? "AutoDealer" : "Person",
          name: vehicle.dealer?.tradeName || vehicle.user.name || "Vendedor",
        }}
        color={vehicle.color}
        vehicleType={vehicle.vehicleType}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          { name: "Vehículos", url: `${SITE_URL}/vehiculos` },
          { name: vehicle.brand.name, url: `${SITE_URL}/vehiculos?brand=${vehicle.brand.slug}` },
          { name: vehicle.model.name },
        ]}
      />

      <main className="min-h-screen bg-neutral-50 pb-24 md:pb-12">
        <Container>
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-neutral-500 mb-4">
              <span>Vehículos</span>
              <span className="mx-2">/</span>
              <span>{vehicle.brand.name}</span>
              <span className="mx-2">/</span>
              <span className="text-neutral-900">{vehicle.model.name}</span>
            </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery images={vehicle.images} title={vehicle.title} />

              {/* Title and Price - Mobile */}
              <div className="lg:hidden bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {vehicle.featured && (
                        <Badge variant="warning" size="sm" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Destacado
                        </Badge>
                      )}
                      {vehicle.condition === "NUEVO" && (
                        <Badge variant="success" size="sm">Nuevo</Badge>
                      )}
                      {vehicle.condition === "USADO" && (
                        <Badge variant="default" size="sm">Usado</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                      {vehicle.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShareButtons
                      title={vehicle.title}
                      url={`/vehiculos/${vehicle.slug}`}
                      description={`${vehicle.brand.name} ${vehicle.model.name} ${vehicle.year} - ${formatPrice(vehicle.price)}`}
                    />
                    <FavoriteButton
                      vehicleId={vehicle.id}
                      vehicleSlug={vehicle.slug}
                      initialFavorited={isFavorited}
                      isLoggedIn={!!session?.user}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-bold text-andino-700">
                    {formatPrice(vehicle.price)}
                  </p>
                  {vehicle.negotiable && (
                    <p className="text-sm text-neutral-500 mt-1">Precio negociable</p>
                  )}
                </div>
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

            {/* Right Column - Contact Card */}
            <div className="space-y-6">
              {/* Title and Price - Desktop */}
              <div className="hidden lg:block bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    {vehicle.featured && (
                      <Badge variant="warning" size="sm" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Destacado
                      </Badge>
                    )}
                    {vehicle.condition === "NUEVO" && (
                      <Badge variant="success" size="sm">Nuevo</Badge>
                    )}
                    {vehicle.condition === "USADO" && (
                      <Badge variant="default" size="sm">Usado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShareButtons
                      title={vehicle.title}
                      url={`/vehiculos/${vehicle.slug}`}
                      description={`${vehicle.brand.name} ${vehicle.model.name} ${vehicle.year} - ${formatPrice(vehicle.price)}`}
                    />
                    <FavoriteButton
                      vehicleId={vehicle.id}
                      vehicleSlug={vehicle.slug}
                      initialFavorited={isFavorited}
                      isLoggedIn={!!session?.user}
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mt-2">
                  {vehicle.title}
                </h1>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-andino-700">
                    {formatPrice(vehicle.price)}
                  </p>
                  {vehicle.negotiable && (
                    <p className="text-sm text-neutral-500 mt-1">Precio negociable</p>
                  )}
                </div>
              </div>

              {/* Dealer Info Card - only shown if vehicle belongs to a dealer */}
              {vehicle.dealer && (
                <DealerInfoCard
                  dealer={{
                    ...vehicle.dealer,
                    schedule: vehicle.dealer.schedule as WeekSchedule | null,
                  }}
                />
              )}

              {/* Contact Card */}
              <ContactCard
                vehicle={{
                  id: vehicle.id,
                  title: vehicle.title,
                  contactPhone: vehicle.contactPhone,
                  contactWhatsApp: vehicle.contactWhatsApp,
                  showPhone: vehicle.showPhone,
                }}
                seller={{
                  id: vehicle.user.id,
                  name: vehicle.user.name,
                  image: vehicle.user.image,
                  memberSince: vehicle.user.createdAt,
                }}
                region={vehicle.region.name}
                comuna={vehicle.comuna?.name}
                currentUserId={session?.user?.id}
              />
            </div>
          </div>
        </div>
      </Container>

        {/* Related Vehicles */}
        <RelatedVehicles
          currentVehicleId={vehicle.id}
          brandId={vehicle.brandId}
          price={vehicle.price}
          vehicleType={vehicle.vehicleType}
        />

        {/* Mobile Sticky Contact */}
        <MobileStickyContact
          title={vehicle.title}
          contactPhone={vehicle.contactPhone}
          contactWhatsApp={vehicle.contactWhatsApp}
          showPhone={vehicle.showPhone}
        />
      </main>
    </>
  );
}
