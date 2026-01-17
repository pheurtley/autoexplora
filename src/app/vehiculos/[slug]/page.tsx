import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import { ImageGallery } from "@/components/vehicles/ImageGallery";
import { VehicleSpecs } from "@/components/vehicles/VehicleSpecs";
import { ContactCard } from "@/components/vehicles/ContactCard";
import { DealerInfoCard } from "@/components/vehicles/DealerInfoCard";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";
import { Badge } from "@/components/ui";
import type { WeekSchedule } from "@/components/ui";
import { formatPrice, isCuid } from "@/lib/utils";
import { Star, Eye, Calendar } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to find vehicle by slug or ID (for backwards compatibility)
async function findVehicle(param: string) {
  // First try by slug
  let vehicle = await prisma.vehicle.findUnique({
    where: { slug: param },
    select: { id: true, slug: true, title: true, price: true, brand: { select: { name: true } } },
  });

  // If not found and looks like a CUID, try by ID
  if (!vehicle && isCuid(param)) {
    vehicle = await prisma.vehicle.findUnique({
      where: { id: param },
      select: { id: true, slug: true, title: true, price: true, brand: { select: { name: true } } },
    });
  }

  return vehicle;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: param } = await params;

  const vehicle = await findVehicle(param);

  if (!vehicle) {
    return { title: "Vehículo no encontrado" };
  }

  return {
    title: `${vehicle.title} | AutoExplora.cl`,
    description: `${vehicle.brand.name} - ${formatPrice(vehicle.price)}. Ver detalles y contactar al vendedor.`,
    alternates: {
      canonical: `/vehiculos/${vehicle.slug}`,
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

  const publishedDate = new Date(vehicle.publishedAt).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-neutral-50 pb-12">
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
                  <FavoriteButton
                    vehicleId={vehicle.id}
                    vehicleSlug={vehicle.slug}
                    initialFavorited={isFavorited}
                    isLoggedIn={!!session?.user}
                  />
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

              {/* Publication Info */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Publicado el {publishedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{vehicle.views} visitas</span>
                  </div>
                </div>
              </div>
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
                  <FavoriteButton
                    vehicleId={vehicle.id}
                    vehicleSlug={vehicle.slug}
                    initialFavorited={isFavorited}
                    isLoggedIn={!!session?.user}
                  />
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
    </main>
  );
}
