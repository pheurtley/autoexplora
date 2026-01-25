"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useContactTracking } from "@/hooks";
import { MessageCircle } from "lucide-react";
import type { ChatButtonProps } from "@/types/chat";

export function ChatButton({
  vehicleId,
  sellerId,
  vehicleTitle,
  currentUserId,
  className,
}: ChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { trackContact } = useContactTracking();

  // Don't show button if user is the seller
  if (currentUserId === sellerId) {
    return null;
  }

  const handleClick = async () => {
    // Redirect to login if not authenticated
    if (!currentUserId) {
      router.push(`/login?callbackUrl=/vehiculos/${vehicleId}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mensajes/conversaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al iniciar conversación");
      }

      const data = await response.json();
      trackContact("CHAT_START", { vehicleId });
      router.push(`/cuenta/mensajes/${data.conversationId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert(
        error instanceof Error ? error.message : "Error al iniciar conversación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      fullWidth
      onClick={handleClick}
      loading={loading}
      className={className}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Enviar mensaje
    </Button>
  );
}
