"use client";

import {
  Phone,
  Mail,
  MessageCircle,
  StickyNote,
  ArrowRightLeft,
  UserPlus,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

interface LeadActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  NOTE: StickyNote,
  CALL: Phone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  STATUS_CHANGE: ArrowRightLeft,
  ASSIGNMENT: UserPlus,
  TEST_DRIVE: Car,
};

const ACTIVITY_COLORS: Record<string, string> = {
  NOTE: "bg-neutral-100 text-neutral-600",
  CALL: "bg-green-100 text-green-600",
  EMAIL: "bg-blue-100 text-blue-600",
  WHATSAPP: "bg-emerald-100 text-emerald-600",
  STATUS_CHANGE: "bg-amber-100 text-amber-600",
  ASSIGNMENT: "bg-purple-100 text-purple-600",
  TEST_DRIVE: "bg-teal-100 text-teal-600",
};

const ACTIVITY_LABELS: Record<string, string> = {
  NOTE: "agregó una nota",
  CALL: "registró una llamada",
  EMAIL: "registró un email",
  WHATSAPP: "registró mensaje de WhatsApp",
  STATUS_CHANGE: "cambió el estado",
  ASSIGNMENT: "asignó el lead",
  TEST_DRIVE: "programó test drive",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  QUALIFIED: "Calificado",
  CONVERTED: "Convertido",
  LOST: "Perdido",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadActivityTimeline({
  activities,
  loading,
}: LeadActivityTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-neutral-500">
        Sin actividad registrada
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-200" />

      {/* Activities */}
      <ul className="space-y-4">
        {activities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type] || StickyNote;
          const iconColor =
            ACTIVITY_COLORS[activity.type] || "bg-neutral-100 text-neutral-600";
          const label = ACTIVITY_LABELS[activity.type] || "realizó una acción";

          // Get metadata values
          const metadata = activity.metadata as {
            oldStatus?: string;
            newStatus?: string;
            assignedToName?: string;
          } | null;

          return (
            <li key={activity.id} className="relative pl-10">
              {/* Icon */}
              <div
                className={cn(
                  "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center",
                  iconColor
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-neutral-900">
                    {activity.user.name || "Usuario"}
                  </span>
                  <span className="text-neutral-500">{label}</span>
                </div>

                {/* Activity-specific content */}
                {activity.type === "STATUS_CHANGE" && metadata && (
                  <p className="mt-1 text-sm text-neutral-600">
                    De{" "}
                    <span className="font-medium">
                      {STATUS_LABELS[metadata.oldStatus || ""] || metadata.oldStatus}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {STATUS_LABELS[metadata.newStatus || ""] || metadata.newStatus}
                    </span>
                  </p>
                )}

                {activity.type === "ASSIGNMENT" && metadata && (
                  <p className="mt-1 text-sm text-neutral-600">
                    A{" "}
                    <span className="font-medium">
                      {metadata.assignedToName || "Sin asignar"}
                    </span>
                  </p>
                )}

                {activity.content && (
                  <p className="mt-1 text-sm text-neutral-700 bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                    {activity.content}
                  </p>
                )}

                {/* Timestamp */}
                <p className="mt-1 text-xs text-neutral-400">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
