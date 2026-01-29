import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Página no encontrada | AutoExplora.cl",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center">
      <Container className="py-16 text-center">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-2">
          Página no encontrada
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          La página que buscas no existe o ha sido movida. Prueba navegando
          desde las opciones de abajo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-andino-600 rounded-lg hover:bg-andino-700 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/vehiculos"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Buscar vehículos
          </Link>
          <Link
            href="/automotoras"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Ver automotoras
          </Link>
        </div>
      </Container>
    </div>
  );
}
