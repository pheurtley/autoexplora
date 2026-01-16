"use client";

import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui";

export function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        No tienes conversaciones
      </h3>
      <p className="text-neutral-500 mb-6 max-w-sm">
        Cuando contactes a un vendedor sobre un vehículo, tus conversaciones
        aparecerán aquí.
      </p>
      <Link href="/vehiculos">
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Buscar vehículos
        </Button>
      </Link>
    </div>
  );
}
