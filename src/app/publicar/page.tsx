import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout";
import { PublishForm } from "@/components/forms/PublishForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar Vehículo | AutoExplora.cl",
  description: "Publica tu vehículo en AutoExplora.cl y llega a miles de compradores en Chile.",
  robots: { index: false, follow: false },
};

export default async function PublicarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/publicar");
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Publica tu vehículo
          </h1>
          <p className="mt-2 text-neutral-600">
            Completa los siguientes pasos para publicar tu anuncio
          </p>
        </div>

        {/* Form */}
        <PublishForm />
      </Container>
    </main>
  );
}
