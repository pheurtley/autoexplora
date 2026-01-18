import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Container } from "@/components/layout";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  CheckCircle,
  Car,
  ExternalLink,
} from "lucide-react";
import { Button, BusinessHoursDisplay } from "@/components/ui";
import type { WeekSchedule } from "@/components/ui";
import { Clock } from "lucide-react";

interface DealerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DealerPageProps): Promise<Metadata> {
  const { slug } = await params;

  const dealer = await prisma.dealer.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { tradeName: true, description: true, type: true },
  });

  if (!dealer) {
    return { title: "Automotora no encontrada | AutoExplora.cl" };
  }

  const typeLabel =
    dealer.type === "AUTOMOTORA"
      ? "Automotora"
      : "Rent a Car";

  return {
    title: `${dealer.tradeName} - ${typeLabel} | AutoExplora.cl`,
    description:
      dealer.description?.slice(0, 160) ||
      `Encuentra vehículos en ${dealer.tradeName}`,
  };
}

export default async function DealerPublicPage({ params }: DealerPageProps) {
  const { slug } = await params;

  const dealer = await prisma.dealer.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      id: true,
      tradeName: true,
      businessName: true,
      type: true,
      email: true,
      phone: true,
      whatsapp: true,
      website: true,
      address: true,
      logo: true,
      banner: true,
      description: true,
      schedule: true,
      verifiedAt: true,
      region: true,
      comuna: true,
      vehicles: {
        where: { status: "ACTIVE" },
        take: 20,
        orderBy: { publishedAt: "desc" },
        include: {
          brand: true,
          model: true,
          region: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
      _count: {
        select: {
          vehicles: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  });

  if (!dealer) {
    notFound();
  }

  const typeLabel =
    dealer.type === "AUTOMOTORA"
      ? "Automotora"
      : "Rent a Car";

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header / Banner */}
      <div className="bg-white border-b border-neutral-200">
        {dealer.banner && (
          <div className="h-48 sm:h-64 bg-neutral-200 overflow-hidden">
            <img
              src={dealer.banner}
              alt={`Banner de ${dealer.tradeName}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Container>
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Logo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white border border-neutral-200 flex items-center justify-center overflow-hidden -mt-12 sm:-mt-16 relative z-10 shadow-lg flex-shrink-0">
                {dealer.logo ? (
                  <img
                    src={dealer.logo}
                    alt={dealer.tradeName}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-neutral-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                    {dealer.tradeName}
                  </h1>
                  {dealer.verifiedAt && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verificado
                    </span>
                  )}
                </div>

                <p className="mt-1 text-neutral-600">{typeLabel}</p>

                <div className="flex items-center gap-2 mt-3 text-sm text-neutral-500">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {dealer.comuna?.name && `${dealer.comuna.name}, `}
                    {dealer.region.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                  <Car className="w-4 h-4" />
                  <span>
                    {dealer._count.vehicles}{" "}
                    {dealer._count.vehicles === 1 ? "vehículo" : "vehículos"} disponibles
                  </span>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                {dealer.whatsapp && (
                  <a
                    href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full sm:w-auto">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                )}
                <a href={`tel:${dealer.phone}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {dealer.description && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Sobre nosotros
                </h2>
                <p className="text-neutral-700 whitespace-pre-line">
                  {dealer.description}
                </p>
              </div>
            )}

            {/* Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Vehículos Disponibles ({dealer._count.vehicles})
                </h2>
              </div>

              {dealer.vehicles.length === 0 ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                  <Car className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">
                    No hay vehículos disponibles en este momento
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {dealer.vehicles.map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      href={`/vehiculos/${vehicle.slug}`}
                      className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[16/10] bg-neutral-100">
                        {vehicle.images[0]?.url && (
                          <img
                            src={vehicle.images[0].url}
                            alt={vehicle.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          {vehicle.title}
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                          {vehicle.brand.name} {vehicle.model.name} {vehicle.year}
                        </p>
                        <p className="text-lg font-bold text-andino-600 mt-2">
                          ${vehicle.price.toLocaleString("es-CL")}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {vehicle.region.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Hours Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-neutral-700" />
                <h2 className="text-lg font-semibold text-neutral-900">
                  Horarios de Atención
                </h2>
              </div>
              <BusinessHoursDisplay
                schedule={dealer.schedule as WeekSchedule | null}
                showStatus={true}
              />
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Contacto
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      Dirección
                    </p>
                    <p className="text-sm text-neutral-600">
                      {dealer.address}
                      <br />
                      {dealer.comuna?.name && `${dealer.comuna.name}, `}
                      {dealer.region.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      Teléfono
                    </p>
                    <a
                      href={`tel:${dealer.phone}`}
                      className="text-sm text-andino-600 hover:underline"
                    >
                      {dealer.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Email</p>
                    <a
                      href={`mailto:${dealer.email}`}
                      className="text-sm text-andino-600 hover:underline"
                    >
                      {dealer.email}
                    </a>
                  </div>
                </div>

                {dealer.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-700">
                        Sitio Web
                      </p>
                      <a
                        href={dealer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-andino-600 hover:underline flex items-center gap-1"
                      >
                        Visitar sitio
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 space-y-2">
                {dealer.whatsapp && (
                  <a
                    href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar por WhatsApp
                    </Button>
                  </a>
                )}
                <a href={`tel:${dealer.phone}`} className="block">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
