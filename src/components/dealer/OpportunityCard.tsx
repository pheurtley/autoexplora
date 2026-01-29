"use client";

import Link from "next/link";
import { DollarSign, Calendar, TrendingUp, Car, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string | null;
  status: string;
  notes: string | null;
  lead: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "error" | "info" }> = {
  OPEN: { label: "Abierta", variant: "info" },
  WON: { label: "Ganada", variant: "success" },
  LOST: { label: "Perdida", variant: "error" },
};

export function OpportunityCard({ opportunity, onEdit }: OpportunityCardProps) {
  const statusConfig = STATUS_CONFIG[opportunity.status] || STATUS_CONFIG.OPEN;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-andino-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link
            href={`/dealer/leads?leadId=${opportunity.lead.id}`}
            className="font-medium text-neutral-900 hover:text-andino-600"
          >
            {opportunity.lead.name}
          </Link>
          {opportunity.vehicle && (
            <p className="text-sm text-andino-600 flex items-center gap-1 mt-0.5">
              <Car className="h-3.5 w-3.5" />
              {opportunity.vehicle.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {opportunity.status === "OPEN" && (
            <button
              onClick={onEdit}
              className="p-1.5 text-neutral-400 hover:text-andino-600 hover:bg-neutral-100 rounded transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            Valor
          </div>
          <p className="font-semibold text-green-600">
            ${opportunity.estimatedValue.toLocaleString("es-CL")}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Probabilidad
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  opportunity.probability >= 70
                    ? "bg-green-500"
                    : opportunity.probability >= 40
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{ width: `${opportunity.probability}%` }}
              />
            </div>
            <span className="text-xs font-medium">{opportunity.probability}%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <Calendar className="h-3.5 w-3.5" />
            Cierre esperado
          </div>
          <p className="font-medium text-neutral-900">
            {opportunity.expectedCloseDate
              ? new Date(opportunity.expectedCloseDate).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </p>
        </div>
      </div>

      {opportunity.notes && (
        <p className="text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
          {opportunity.notes}
        </p>
      )}
    </div>
  );
}
