import Link from "next/link";
import { Car, Home } from "lucide-react";

export default function MicrositeNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            backgroundColor: "color-mix(in srgb, var(--ms-primary) 10%, transparent)",
            color: "var(--ms-primary)",
          }}
        >
          <Car className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">404</h1>
        <p className="text-lg text-neutral-600 mb-2">Página no encontrada</p>
        <p className="text-sm text-neutral-500 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg text-sm transition-colors"
            style={{ backgroundColor: "var(--ms-primary)" }}
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          <Link
            href="/vehiculos"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg text-sm hover:bg-neutral-50 transition-colors"
          >
            <Car className="h-4 w-4" />
            Ver vehículos
          </Link>
        </div>
      </div>
    </div>
  );
}
