"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { useContactTracking } from "@/hooks";

interface MicrositeVehicleContactButtonsProps {
  vehicleId: string;
  dealerId: string;
  dealerName: string;
  whatsappNumber: string | null;
  whatsappMessage: string;
  contactPhone: string | null;
}

export function MicrositeVehicleContactButtons({
  vehicleId,
  dealerId,
  dealerName,
  whatsappNumber,
  whatsappMessage,
  contactPhone,
}: MicrositeVehicleContactButtonsProps) {
  const { trackContact } = useContactTracking();

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="font-semibold text-neutral-900 mb-4">
        Contactar a {dealerName}
      </h3>

      <div className="space-y-3">
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact("WHATSAPP_CLICK", { vehicleId, dealerId, source: "microsite" })}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>
        )}

        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            onClick={() => trackContact("PHONE_CALL", { vehicleId, dealerId, source: "microsite" })}
            className="flex items-center justify-center gap-2 w-full py-3 border-2 rounded-lg font-medium transition-colors"
            style={{
              borderColor: "var(--ms-primary)",
              color: "var(--ms-primary)",
            }}
          >
            <Phone className="h-5 w-5" />
            Llamar
          </a>
        )}

        <Link
          href={`/contacto?vehicleId=${vehicleId}`}
          className="flex items-center justify-center w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors text-sm"
        >
          Enviar consulta
        </Link>
      </div>
    </div>
  );
}
