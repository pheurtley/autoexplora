import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout";
import { DealerRegistrationForm } from "@/components/forms/DealerRegistrationForm";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Registrar Automotora | AutoExplora.cl",
  description:
    "Registra tu automotora en AutoExplora.cl y llega a miles de compradores.",
};

export default function RegistroAutomotoraPage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4">
      <Container className="max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-andino-600">
              AutoExplora.cl
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 sm:p-8">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-andino-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-andino-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Registrar Automotora
              </h1>
              <p className="text-sm text-neutral-600">
                Crea tu cuenta de automotora
              </p>
            </div>
          </div>

          {/* Form */}
          <DealerRegistrationForm />
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-neutral-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-andino-600 hover:text-andino-700"
            >
              Inicia sesión
            </Link>
          </p>
          <p className="text-sm text-neutral-600">
            ¿Eres particular?{" "}
            <Link
              href="/registro"
              className="font-medium text-andino-600 hover:text-andino-700"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
