"use client";

import { useState } from "react";
import { User, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string | null;
}

interface LeadAssignSelectProps {
  currentAssignee: TeamMember | null;
  teamMembers: TeamMember[];
  onAssign: (userId: string | null) => Promise<void>;
  disabled?: boolean;
}

export function LeadAssignSelect({
  currentAssignee,
  teamMembers,
  onAssign,
  disabled,
}: LeadAssignSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (userId: string | null) => {
    if (userId === currentAssignee?.id) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await onAssign(userId);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors w-full",
          "hover:border-andino-300 hover:bg-neutral-50",
          isOpen && "border-andino-400 bg-neutral-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <User className="h-4 w-4 text-neutral-500" />
        <span className="flex-1 text-left truncate">
          {currentAssignee?.name || "Sin asignar"}
        </span>
        {loading ? (
          <div className="h-4 w-4 border-2 border-andino-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
            {/* Unassign option */}
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 transition-colors",
                !currentAssignee && "bg-andino-50 text-andino-700"
              )}
            >
              <User className="h-4 w-4 text-neutral-400" />
              <span className="flex-1">Sin asignar</span>
              {!currentAssignee && <Check className="h-4 w-4 text-andino-600" />}
            </button>

            <div className="border-t border-neutral-100 my-1" />

            {/* Team members */}
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 transition-colors",
                  currentAssignee?.id === member.id &&
                    "bg-andino-50 text-andino-700"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-andino-100 flex items-center justify-center text-xs font-medium text-andino-700">
                  {member.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <span className="flex-1 truncate">{member.name || "Sin nombre"}</span>
                {currentAssignee?.id === member.id && (
                  <Check className="h-4 w-4 text-andino-600" />
                )}
              </button>
            ))}

            {teamMembers.length === 0 && (
              <p className="px-3 py-2 text-sm text-neutral-500">
                No hay miembros del equipo
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
