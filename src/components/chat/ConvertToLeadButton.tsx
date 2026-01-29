"use client";

import { useState, useEffect } from "react";
import { UserPlus, Check, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ConvertToLeadButtonProps {
  conversationId: string;
}

export function ConvertToLeadButton({ conversationId }: ConvertToLeadButtonProps) {
  const [status, setStatus] = useState<"loading" | "idle" | "exists" | "converting" | "success" | "error">("loading");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLeadExists();
  }, [conversationId]);

  const checkLeadExists = async () => {
    try {
      const res = await fetch(`/api/dealer/leads/from-conversation?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setLeadId(data.lead.id);
          setStatus("exists");
        } else {
          setStatus("idle");
        }
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  const handleConvert = async () => {
    setStatus("converting");
    setError(null);

    try {
      const res = await fetch("/api/dealer/leads/from-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      const data = await res.json();

      if (res.ok) {
        setLeadId(data.lead.id);
        setStatus("success");
      } else if (res.status === 409) {
        // Lead already exists
        setLeadId(data.leadId);
        setStatus("exists");
      } else {
        setError(data.error || "Error al crear lead");
        setStatus("error");
      }
    } catch {
      setError("Error de conexión");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="p-2">
        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (status === "exists" || status === "success") {
    return (
      <Link
        href={`/dealer/leads?leadId=${leadId}`}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          "bg-green-50 text-green-700 hover:bg-green-100"
        )}
        title="Ver en CRM"
      >
        <Check className="w-4 h-4" />
        <span className="hidden sm:inline">En CRM</span>
        <ExternalLink className="w-3 h-3" />
      </Link>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={handleConvert}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          "bg-red-50 text-red-700 hover:bg-red-100"
        )}
        title={error || "Error"}
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Reintentar</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleConvert}
      disabled={status === "converting"}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        "bg-andino-50 text-andino-700 hover:bg-andino-100",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      title="Agregar al CRM como Lead"
    >
      {status === "converting" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {status === "converting" ? "Creando..." : "Agregar a CRM"}
      </span>
    </button>
  );
}
