"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MessageCircle, BadgeCheck, ExternalLink } from "lucide-react";
import { Button, Badge, BusinessHoursDisplay } from "@/components/ui";
import { useContactTracking } from "@/hooks";
import type { WeekSchedule } from "@/components/ui";
import { DEALER_TYPES } from "@/lib/constants";
import type { DealerType } from "@prisma/client";

interface DealerInfoCardProps {
  dealer: {
    id: string;
    slug: string;
    tradeName: string;
    type: DealerType;
    logo: string | null;
    phone: string;
    whatsapp: string | null;
    verifiedAt: Date | null;
    schedule: WeekSchedule | null;
  };
}

export function DealerInfoCard({ dealer }: DealerInfoCardProps) {
  const typeConfig = DEALER_TYPES[dealer.type];
  const isVerified = dealer.verifiedAt !== null;
  const { trackContact } = useContactTracking();

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      {/* Header with Logo and Name */}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {dealer.logo ? (
            <Image
              src={dealer.logo}
              alt={dealer.tradeName}
              width={64}
              height={64}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <Building2 className="w-8 h-8 text-neutral-400" />
          )}
        </div>

        {/* Name and Badges */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/automotora/${dealer.slug}`}
            className="font-semibold text-neutral-900 hover:text-andino-600 transition-colors line-clamp-1"
          >
            {dealer.tradeName}
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="default" size="sm">
              {typeConfig.label}
            </Badge>
            {isVerified && (
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                Verificado
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Open/Closed Status */}
      <div className="mt-4">
        <BusinessHoursDisplay
          schedule={dealer.schedule}
          showStatus={true}
          compact={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        {dealer.whatsapp && (
          <a
            href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, me interesa un vehículo que vi en AutoExplora.cl")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact("WHATSAPP_CLICK", { dealerId: dealer.id })}
            className="block"
          >
            <Button className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contactar por WhatsApp
            </Button>
          </a>
        )}
        <Link href={`/automotora/${dealer.slug}`} className="block">
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver perfil completo
          </Button>
        </Link>
      </div>
    </div>
  );
}
