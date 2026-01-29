"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mail, Phone, Car, User, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  source: string;
  createdAt: string;
  isDuplicate: boolean;
  estimatedValue: number | null;
  lastContactAt: string | null;
  nextFollowUp: string | null;
  notes: string | null;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
  vehicle: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isDragging?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export function LeadCard({ lead, onClick, isDragging }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Don't open modal when dragging
        if (!dragging) {
          onClick();
        }
      }}
      className={cn(
        "bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing",
        "hover:border-andino-300 hover:shadow-sm transition-all",
        dragging && "opacity-50 shadow-lg",
        lead.isDuplicate && "border-amber-300 bg-amber-50/50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-neutral-900 text-sm truncate flex-1">
          {lead.name}
        </p>
        {lead.isDuplicate && (
          <div
            className="flex-shrink-0 text-amber-600"
            title="Posible duplicado"
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Vehicle */}
      {lead.vehicle && (
        <div className="flex items-center gap-1.5 text-xs text-andino-600 mb-2">
          <Car className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{lead.vehicle.title}</span>
        </div>
      )}

      {/* Contact info */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(lead.createdAt)}
        </div>
        {lead.assignedTo && (
          <div className="flex items-center gap-1" title={`Asignado a ${lead.assignedTo.name}`}>
            <User className="h-3 w-3" />
            <span className="truncate max-w-[60px]">
              {lead.assignedTo.name?.split(" ")[0]}
            </span>
          </div>
        )}
      </div>

      {/* Estimated value if present */}
      {lead.estimatedValue && (
        <div className="mt-2 text-xs font-medium text-green-600">
          ${lead.estimatedValue.toLocaleString("es-CL")}
        </div>
      )}
    </div>
  );
}

// Non-draggable version for overlay during drag
export function LeadCardOverlay({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white rounded-lg border border-andino-400 p-3 shadow-xl w-[220px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-neutral-900 text-sm truncate flex-1">
          {lead.name}
        </p>
        {lead.isDuplicate && (
          <div className="flex-shrink-0 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
      </div>
      {lead.vehicle && (
        <div className="flex items-center gap-1.5 text-xs text-andino-600 mb-2">
          <Car className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{lead.vehicle.title}</span>
        </div>
      )}
      <div className="text-xs text-neutral-500 truncate">{lead.email}</div>
    </div>
  );
}
