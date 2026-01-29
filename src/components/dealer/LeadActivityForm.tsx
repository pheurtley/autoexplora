"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  StickyNote,
  Send,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

const ACTIVITY_TYPES = [
  { value: "NOTE", label: "Nota", icon: StickyNote },
  { value: "CALL", label: "Llamada", icon: Phone },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
] as const;

interface LeadActivityFormProps {
  leadId: string;
  onActivityAdded: () => void;
}

export function LeadActivityForm({ leadId, onActivityAdded }: LeadActivityFormProps) {
  const [type, setType] = useState<string>("NOTE");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content: content.trim() }),
      });

      if (res.ok) {
        setContent("");
        onActivityAdded();
      }
    } catch (error) {
      console.error("Error adding activity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Activity Type Selector */}
      <div className="flex gap-1">
        {ACTIVITY_TYPES.map((actType) => {
          const Icon = actType.icon;
          return (
            <button
              key={actType.value}
              type="button"
              onClick={() => setType(actType.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                type === actType.value
                  ? "bg-andino-100 text-andino-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {actType.label}
            </button>
          );
        })}
      </div>

      {/* Content Input */}
      <div className="flex gap-2">
        <Input
          placeholder={
            type === "CALL"
              ? "Resumen de la llamada..."
              : type === "EMAIL"
              ? "Resumen del email enviado..."
              : type === "WHATSAPP"
              ? "Resumen de la conversación..."
              : "Agregar una nota..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
