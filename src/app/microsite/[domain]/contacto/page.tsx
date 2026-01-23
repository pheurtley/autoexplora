import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { MicrositeContactForm } from "@/components/microsite/MicrositeContactForm";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ vehicleId?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) return {};

  return {
    title: `Contacto | ${config.dealer.tradeName}`,
    description: `Contáctanos en ${config.dealer.tradeName}. Estamos para ayudarte a encontrar tu vehículo ideal.`,
  };
}

export default async function MicrositeContactPage({
  params,
  searchParams,
}: PageProps) {
  const { domain } = await params;
  const sp = await searchParams;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    notFound();
  }

  const { dealer } = config;

  // If vehicleId is provided, get vehicle info for context
  let vehicleContext: { id: string; title: string } | null = null;
  if (sp.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: sp.vehicleId, dealerId: dealer.id, status: "ACTIVE" },
      select: { id: true, title: true },
    });
    if (vehicle) {
      vehicleContext = vehicle;
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">Contáctanos</h1>
          <p className="text-neutral-600 mt-2 max-w-lg mx-auto">
            ¿Tienes alguna consulta? Completa el formulario y te responderemos a
            la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              {vehicleContext && (
                <div className="mb-6 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    Consulta sobre:{" "}
                    <span className="font-medium text-neutral-900">
                      {vehicleContext.title}
                    </span>
                  </p>
                </div>
              )}
              <MicrositeContactForm
                dealerId={dealer.id}
                vehicleId={vehicleContext?.id}
              />
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-semibold text-neutral-900 text-lg mb-4">
                {dealer.tradeName}
              </h2>

              <div className="space-y-4">
                {(dealer.comuna || dealer.region) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-neutral-600">
                      {dealer.comuna?.name}
                      {dealer.region && <>, {dealer.region.name}</>}
                    </div>
                  </div>
                )}

                {config.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-neutral-400 shrink-0" />
                    <a
                      href={`tel:${config.contactPhone}`}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {config.contactPhone}
                    </a>
                  </div>
                )}

                {config.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-neutral-400 shrink-0" />
                    <a
                      href={`mailto:${config.contactEmail}`}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {config.contactEmail}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-neutral-400 shrink-0" />
                  <span className="text-sm text-neutral-600">
                    Lun - Sáb: 9:00 - 19:00
                  </span>
                </div>
              </div>

              {/* WhatsApp CTA */}
              {config.showWhatsAppButton && config.contactWhatsApp && (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <a
                    href={`https://wa.me/${config.contactWhatsApp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Escríbenos por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
