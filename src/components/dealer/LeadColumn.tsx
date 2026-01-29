"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LeadCard, Lead } from "./LeadCard";
import { cn } from "@/lib/utils";

interface LeadColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  color: string;
  onLeadClick: (lead: Lead) => void;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "border-t-blue-500",
  CONTACTED: "border-t-purple-500",
  QUALIFIED: "border-t-amber-500",
  CONVERTED: "border-t-green-500",
  LOST: "border-t-neutral-400",
};

export function LeadColumn({
  id,
  title,
  leads,
  color,
  onLeadClick,
}: LeadColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        "flex flex-col bg-neutral-50 rounded-lg border border-neutral-200 min-w-[240px] w-[240px] max-h-[calc(100vh-220px)]",
        "border-t-4",
        STATUS_COLORS[id] || color,
        isOver && "bg-andino-50/50 border-andino-300"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200">
        <h3 className="font-semibold text-sm text-neutral-700">{title}</h3>
        <span className="inline-flex items-center justify-center bg-neutral-200 text-neutral-600 text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1.5">
          {leads.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {leads.length === 0 && (
          <div className="py-8 text-center text-sm text-neutral-400">
            Sin leads
          </div>
        )}
      </div>
    </div>
  );
}
