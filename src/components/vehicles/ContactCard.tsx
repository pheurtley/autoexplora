"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { ChatButton } from "@/components/chat";
import { getWhatsAppLink, getRelativeTime } from "@/lib/utils";
import { Phone, MessageCircle, User, MapPin, Calendar } from "lucide-react";

interface ContactCardProps {
  vehicle: {
    id: string;
    title: string;
    contactPhone: string | null;
    contactWhatsApp: string | null;
    showPhone: boolean;
  };
  seller: {
    id: string;
    name: string | null;
    image: string | null;
    memberSince: Date;
  };
  region: string;
  comuna?: string | null;
  currentUserId?: string;
}

export function ContactCard({
  vehicle,
  seller,
  region,
  comuna,
  currentUserId,
}: ContactCardProps) {
  const [showPhone, setShowPhone] = useState(false);

  const whatsappMessage = `Hola, me interesa el ${vehicle.title} publicado en AutoExplora.cl. ¿Está disponible?`;

  const formatPhone = (phone: string) => {
    // Format Chilean phone: +56 9 1234 5678
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("569")) {
      return `+56 9 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6 lg:sticky lg:top-24">
      {/* Seller Info */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-andino-100 flex items-center justify-center overflow-hidden">
          {seller.image ? (
            <Image
              src={seller.image}
              alt={seller.name || "Vendedor"}
              width={56}
              height={56}
              className="object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-andino-600" />
          )}
        </div>
        <div>
          <p className="font-semibold text-neutral-900">
            {seller.name || "Vendedor particular"}
          </p>
          <p className="text-sm text-neutral-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Miembro desde {getRelativeTime(seller.memberSince)}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-neutral-600">
        <MapPin className="w-5 h-5 text-andino-600" />
        <span>
          {comuna ? `${comuna}, ${region}` : region}
        </span>
      </div>

      {/* Contact Buttons */}
      <div className="space-y-3">
        {/* WhatsApp */}
        {vehicle.contactWhatsApp && (
          <a
            href={getWhatsAppLink(vehicle.contactWhatsApp, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Contactar por WhatsApp
          </a>
        )}

        {/* Phone */}
        {vehicle.showPhone && vehicle.contactPhone && (
          <>
            {showPhone ? (
              <a
                href={`tel:${vehicle.contactPhone}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-andino-600 hover:bg-andino-700 text-white rounded-xl font-medium transition-colors"
              >
                <Phone className="w-5 h-5" />
                {formatPhone(vehicle.contactPhone)}
              </a>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowPhone(true)}
                className="py-3"
              >
                <Phone className="w-5 h-5 mr-2" />
                Ver teléfono
              </Button>
            )}
          </>
        )}

        {/* Chat/Message Button */}
        <ChatButton
          vehicleId={vehicle.id}
          sellerId={seller.id}
          vehicleTitle={vehicle.title}
          currentUserId={currentUserId}
          className="py-3"
        />
      </div>

      {/* Safety Tips */}
      <div className="pt-4 border-t border-neutral-100">
        <p className="text-xs text-neutral-500">
          Recuerda verificar el vehículo personalmente antes de realizar
          cualquier pago. Nunca envíes dinero por adelantado.
        </p>
      </div>
    </div>
  );
}
