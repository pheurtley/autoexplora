"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { getWhatsAppLink } from "@/lib/utils";
import { useContactTracking } from "@/hooks";
import { Phone, MessageCircle } from "lucide-react";

interface MobileStickyContactProps {
  vehicleId: string;
  title: string;
  contactPhone: string | null;
  contactWhatsApp: string | null;
  showPhone: boolean;
}

export function MobileStickyContact({
  vehicleId,
  title,
  contactPhone,
  contactWhatsApp,
  showPhone,
}: MobileStickyContactProps) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const { trackContact } = useContactTracking();

  const whatsappMessage = `Hola, me interesa el ${title} publicado en AutoExplora.cl. ¿Está disponible?`;
  const whatsappLink = contactWhatsApp
    ? getWhatsAppLink(contactWhatsApp, whatsappMessage)
    : null;

  const handlePhoneClick = () => {
    if (!showPhone || !contactPhone) return;

    if (!phoneRevealed) {
      trackContact("PHONE_REVEAL", { vehicleId });
      setPhoneRevealed(true);
      return;
    }

    trackContact("PHONE_CALL", { vehicleId });
    window.location.href = `tel:${contactPhone}`;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 z-40 safe-area-inset-bottom">
      <div className="flex gap-3">
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact("WHATSAPP_CLICK", { vehicleId })}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        {showPhone && contactPhone && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePhoneClick}
          >
            <Phone className="h-4 w-4 mr-2" />
            {phoneRevealed ? "Llamar" : "Ver teléfono"}
          </Button>
        )}
      </div>
    </div>
  );
}
