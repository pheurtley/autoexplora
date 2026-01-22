import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EditVehicleForm } from "@/components/forms/EditVehicleForm";
import { Container } from "@/components/layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar Vehículo | AutoExplora.cl",
};

export default async function EditVehiclePage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
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

  // Verify ownership
  if (vehicle.userId !== session.user.id) {
    redirect("/cuenta/publicaciones");
  }

  // Transform vehicle data to match form structure
  const initialData = {
    vehicleType: vehicle.vehicleType,
    category: vehicle.category,
    brandId: vehicle.brandId,
    modelId: vehicle.modelId,
    versionId: vehicle.versionId || "",
    year: vehicle.year,
    condition: vehicle.condition,
    mileage: vehicle.mileage,
    images: vehicle.images.map((img) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId,
      isPrimary: img.isPrimary,
      order: img.order,
    })),
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    color: vehicle.color || "",
    doors: vehicle.doors || undefined,
    engineSize: vehicle.engineSize || "",
    traction: (vehicle as unknown as { traction?: string }).traction || "",
    title: vehicle.title,
    description: vehicle.description || "",
    price: vehicle.price,
    negotiable: vehicle.negotiable,
    regionId: vehicle.regionId,
    comunaId: vehicle.comunaId || "",
    contactPhone: vehicle.contactPhone,
    contactWhatsApp: vehicle.contactWhatsApp || "",
    showPhone: vehicle.showPhone,
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <Container>
        <div className="mb-6">
          <Link
            href="/cuenta/publicaciones"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-andino-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a mis publicaciones
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Editar Vehículo</h1>
          <p className="text-neutral-600 mt-1">
            Modifica los datos de tu publicación
          </p>
        </div>

        <EditVehicleForm vehicleId={vehicle.id} initialData={initialData} />
      </Container>
    </main>
  );
}
